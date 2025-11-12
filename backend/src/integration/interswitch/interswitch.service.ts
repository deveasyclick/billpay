import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PayObject } from 'src/common/types/payment';
import { Config } from 'src/config/configuration';
import {
  INTERSWITCH_BASIC_TOKEN_KEY,
  SUPPORTED_BILL_ITEMS,
} from './interswitch.constants';
import type {
  BillerCategoriesResponse,
  BillerCategoryResponse,
  BillersWithCategoriesResponse,
  ConfirmCardPaymentResponse,
  ConfirmTransactionResponse,
  PaymentItemsResponse,
  TransactionResponse,
  ValidateCustomersResponse,
} from './types';
import type { BillerItem } from 'src/common/types/billerItem';
import { BillCategory, Providers } from '@prisma/client';
import {
  SUPPORTED_BILLERS,
  SUPPORTED_ELECTRICITY_PROVIDERS,
} from 'src/common/constants/biller';
import {
  getStaticInternalCode,
  isStaticCategory,
} from 'src/common/utils/getStaticInternalCode';

interface StoredToken {
  access_token: string;
  token_type: string;
  expiry: number; // timestamp in ms
}

@Injectable()
export class InterSwitchService {
  private readonly logger = new Logger(InterSwitchService.name);
  private pendingTokenPromise: Promise<string> | null = null;
  private readonly baseUrl: string;
  constructor(
    private readonly config: ConfigService<Config>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = `${this.config.get('interswitchApiBaseUrl')}/quicktellerservice/api/v5`;
  }

  async getToken(forceRefresh = false): Promise<string> {
    // Return in-progress promise if any
    if (this.pendingTokenPromise) {
      return this.pendingTokenPromise;
    }

    // Try cache first (unless forceRefresh)
    if (!forceRefresh) {
      const cached = await this.cacheManager.get<string>(
        INTERSWITCH_BASIC_TOKEN_KEY,
      );
      if (cached) {
        try {
          const token: StoredToken = JSON.parse(cached);
          // refresh a little before expiry (e.g. 60s buffer)
          const bufferMs = 60 * 1000;
          if (Date.now() + bufferMs < token.expiry) {
            return token.access_token;
          }
        } catch (_e) {
          // corrupted cache — continue to refresh
        }
      }
    }
    this.pendingTokenPromise = (async () => {
      try {
        const basic = this.config.get('interswitchBasicToken');
        const resp = await this.httpService.axiosRef.post(
          this.config.get('interswitchAuthUrl')!,
          {}, // form b
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${basic}`,
              skipAuth: true, // bypass interceptor
            },
          },
        );
        const data = resp.data as {
          access_token: string;
          expires_in: number;
          token_type?: string;
        };
        if (!data?.access_token || !data?.expires_in) {
          throw new Error('Invalid token response from Interswitch');
        }

        const token: StoredToken = {
          access_token: data.access_token,
          token_type: data.token_type ?? 'Bearer',
          expiry: Date.now() + data.expires_in * 1000,
        };

        await this.cacheManager.set(
          INTERSWITCH_BASIC_TOKEN_KEY,
          JSON.stringify(token),
          Math.floor(data.expires_in),
        );
        return token.access_token;
      } catch (err: any) {
        // ensure we clear cache / pending if failed
        await this.cacheManager
          .del(INTERSWITCH_BASIC_TOKEN_KEY)
          .catch(() => {});
        throw new HttpException(
          {
            statusCode: err.response?.status ?? 500,
            message: err.response?.data ?? err.message,
          },
          err.response?.status ?? 500,
        );
      } finally {
        this.pendingTokenPromise = null;
      }
    })();

    return this.pendingTokenPromise;
  }

  async getBillerCategories(): Promise<BillerCategoriesResponse> {
    const { data } =
      await this.httpService.axiosRef.get<BillerCategoriesResponse>(
        `${this.baseUrl}/services/categories`,
      );
    return data;
  }

  async getCategoriesWithBillers(): Promise<BillersWithCategoriesResponse> {
    const { data } =
      await this.httpService.axiosRef.get<BillersWithCategoriesResponse>(
        `${this.baseUrl}/services`,
      );
    return data;
  }

  async getBillerCategory(categoryId: number): Promise<BillerCategoryResponse> {
    const { data } =
      await this.httpService.axiosRef.get<BillerCategoryResponse>(
        `${this.config.get(
          'interswitchApiBaseUrl',
        )!}/quicktellerservice/api/v5/services?categoryid=${categoryId}`,
      );
    return data;
  }

  async getBillerPaymentItems(
    serviceId: string,
  ): Promise<PaymentItemsResponse> {
    const { data } = await this.httpService.axiosRef.get<PaymentItemsResponse>(
      `${this.config.get(
        'interswitchApiBaseUrl',
      )!}/quicktellerservice/api/v5/services/options?serviceid=${serviceId}`,
    );
    return data;
  }

  /**
   *
   * @param customerId // user phone number or dstv number
   * @param paymentCode // Gotten from payment item
   * @returns
   */
  async validateCustomer(
    customerId: string,
    paymentCode: string,
  ): Promise<ValidateCustomersResponse> {
    const body = {
      Customers: [
        {
          PaymentCode: paymentCode,
          CustomerId: customerId,
        },
      ],
      TerminalId: this.config.get('interswitchTerminalId'),
    };

    const { data } =
      await this.httpService.axiosRef.post<ValidateCustomersResponse>(
        `${this.config.get(
          'interswitchApiBaseUrl',
        )!}/quicktellerservice/api/v5/Transactions/validatecustomers`,
        body,
      );
    return data;
  }

  async pay({
    customerId,
    paymentCode,
    amount,
    requestReference,
  }: PayObject): Promise<TransactionResponse> {
    const body = {
      paymentCode,
      customerId,
      customerMobile: customerId,
      amount,
      requestReference: `${this.config.get(
        'interswitchPaymentReferencePrefix',
      )}${requestReference}`,
    };

    const { data } = await this.httpService.axiosRef.post<TransactionResponse>(
      `${this.config.get(
        'interswitchApiBaseUrl',
      )!}/quicktellerservice/api/v5/Transactions`,
      body,
    );
    return data;
  }

  public async confirmTransaction(
    reference: string,
  ): Promise<ConfirmTransactionResponse> {
    const { data } =
      await this.httpService.axiosRef.get<ConfirmTransactionResponse>(
        `${this.config.get(
          'interswitchPaymentBaseUrl',
        )!}/quicktellerservice/api/v5/Transactions?requestRef=${this.config.get(
          'interswitchPaymentReferencePrefix',
        )}${reference}`,
      );
    return data;
  }

  /**
   *  This is used to confirm the transaction after the customer has completed the payment with their card on our frontend
   * @param param0
   * @returns
   */
  public async confirmCardPayment({
    amount,
    transactionReference,
  }: {
    amount: number;
    transactionReference: string;
  }): Promise<ConfirmCardPaymentResponse> {
    const { data } =
      await this.httpService.axiosRef.get<ConfirmCardPaymentResponse>(
        `${this.config.get(
          'interswitchPaymentBaseUrl',
        )!}/gettransaction.json?merchantCode=${this.config.get('interswitchMerchantCode')}&amount=${amount}&transactionReference=${transactionReference}`,
      );
    return data;
  }

  public async findPlans(): Promise<BillerItem[]> {
    const supportedCategories = Object.keys(SUPPORTED_BILL_ITEMS);
    const billingItems: BillerItem[] = [];

    // 1️⃣ Fetch categories with billers
    const res = await this.getCategoriesWithBillers();
    const allCategories = res.BillerList?.Category ?? [];

    // 2️⃣ Extract only supported billers
    const billers = allCategories.flatMap((category) => {
      if (!supportedCategories.includes(category.Name)) return [];

      const supportedBillerNames = SUPPORTED_BILL_ITEMS[category.Name];
      return category.Billers.filter((biller) =>
        supportedBillerNames.includes(biller.Name),
      ).map((biller) => ({
        id: biller.Id,
        name: biller.Name,
        categoryId: category.Id,
        categoryName: category.Name,
      }));
    });

    // Filter out invalid billers
    const validBillers = billers.filter((b) => b.id);

    // 3️⃣ Fetch all biller items in parallel (with concurrency control)
    const results = await Promise.allSettled(
      validBillers.map((biller) => this.fetchBillerItemsSafe(biller)),
    );

    // 4️⃣ Merge successful results
    for (const r of results) {
      if (r.status === 'fulfilled') billingItems.push(...r.value);
    }

    return billingItems;
  }

  /**
   * Fetches and transforms biller payment items safely.
   */
  private async fetchBillerItemsSafe(biller: {
    id: number;
    name: string;
    categoryId: number;
    categoryName: string;
  }): Promise<BillerItem[]> {
    try {
      const itemsResp = await this.getBillerPaymentItems(String(biller.id));
      const items = itemsResp.PaymentItems ?? [];

      return items
        .map((item) => {
          const amount = Number(item.Amount);
          let displayName = item.Name || item.Id;
          const category = this.getCategory(
            biller.categoryName,
            item.BillerName,
          );
          if (!category) return null;

          // return if airtime and amount is greater than 50 naira and amount type is greater than 1. amount type 1 is minimum. i.e Don’t save an airtime item if amount > ₦50 and it allows payment greater than expected.
          if (
            category === BillCategory.AIRTIME &&
            amount > 5000 &&
            item.AmountType > 1
          ) {
            return null;
          }

          let internalCode = this.getInternalCode(
            item.BillerName,
            category as BillCategory,
            Math.round(amount / 100), // covert amount to naira and round to 2 decimal places to match vtpass amount
          );

          if (category === BillCategory.ELECTRICITY) {
            // use internal code as display name for electricity
            displayName = internalCode.split('-').join(' ').toUpperCase();

            // add postpaid or prepaid to internal code
            if (item.BillerName.toLowerCase().includes('postpaid')) {
              internalCode = `${internalCode}-postpaid`;
            } else {
              internalCode = `${internalCode}-prepaid`;
            }
          }

          if (category === BillCategory.GAMING) {
            displayName = item.BillerName;
          }

          return {
            category,
            billerName: item.BillerName,
            name: displayName,
            amount,
            amountType: item.AmountType,
            active: true,
            internalCode,
            paymentCode: item.PaymentCode,
            billerId: item.BillerId,
            provider: Providers.INTERSWITCH,
          };
        })
        .filter(Boolean) as BillerItem[];
    } catch (err) {
      console.warn(
        `[Interswitch] Failed to fetch items for ${biller.name} (${biller.id}) in ${biller.categoryName}:`,
        err.response?.data ?? err.message ?? err,
      );
      return [];
    }
  }

  private getCategory(categoryName: string, billerName: string) {
    let category: string = '';
    // category in provider is 'Mobile Recharge'
    if (
      categoryName === 'Mobile Recharge' ||
      (categoryName === 'Mobile/Recharge' && billerName.includes('Data'))
    ) {
      // payment item for airtime must have 0 amount type so as to allow customer to buy any amount of airtime
      // this is not the case for DATA bills
      category = 'AIRTIME';
    }

    // category in production is 'Airtime and Data'
    if (
      categoryName === 'Airtime and Data' ||
      categoryName === 'Airtel Data' ||
      (categoryName === 'Mobile/Recharge' && billerName.includes('Data'))
    ) {
      category = 'DATA';
    }

    if (categoryName === 'Utility Bills' || categoryName === 'Utilities') {
      category = 'ELECTRICITY';
    }

    // category in provider is 'Cable TV'
    if (categoryName === 'Cable TV Bills' || categoryName === 'Cable TV') {
      category = 'TV';
    }

    if (categoryName === 'Betting, Lottery and Gaming') {
      category = 'GAMING';
    }

    return category;
  }

  private getInternalCode(billerName: string, category: BillCategory, amount) {
    let name =
      SUPPORTED_BILLERS.find((name) =>
        billerName.toLowerCase().includes(name),
      ) || billerName;
    if (name.toLowerCase().includes('t2')) {
      name = '9mobile';
    }
    if (category === BillCategory.ELECTRICITY) {
      const billerNameLower = billerName.toLowerCase();

      for (const [key, value] of Object.entries(
        SUPPORTED_ELECTRICITY_PROVIDERS,
      )) {
        const values = Array.isArray(value) ? value : [value];

        // Check if the biller name contains the key or any of the value strings
        if (
          billerNameLower.includes(key) ||
          values.some((v) => billerNameLower.includes(v))
        ) {
          name = key;
          break;
        }
      }
    }
    if (isStaticCategory(category)) {
      return getStaticInternalCode(name, category);
    }
    // e.g: mtn-data-amount

    return `${name} ${category} ${Math.round(amount)}`
      .split(' ')
      .join('-')
      .toLowerCase();
  }
}
