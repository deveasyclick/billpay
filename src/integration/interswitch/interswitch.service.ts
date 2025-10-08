import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config/configuration';
import type {
  BillerCategoriesResponse,
  BillerCategoryResponse,
  BillersWithCategoriesResponse,
  PaymentItemsResponse,
  PayResponse,
  TransactionResponse,
  ValidateCustomersResponse,
} from './types';
import { HttpService } from '@nestjs/axios';
import {
  INTERSWITCH_BASIC_TOKEN_KEY,
  SUPPORTED_BILL_ITEMS,
} from './interswitch.constants';
import type { BillerItem } from 'src/common/types/billerItem';
import type { PayObject } from 'src/common/types/payment';

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
  }: PayObject): Promise<PayResponse> {
    const body = {
      paymentCode,
      customerId,
      customerMobile: customerId,
      amount,
      requestReference: `${this.config.get(
        'interswitchPaymentReferencePrefix',
      )}${requestReference}`,
    };

    const { data } = await this.httpService.axiosRef.post<PayResponse>(
      `${this.config.get(
        'interswitchApiBaseUrl',
      )!}/quicktellerservice/api/v5/Transactions`,
      body,
    );
    return data;
  }

  /**
   *  This is used to confirm the transaction after the customer has completed the payment on our frontend
   * @param param0
   * @returns
   */
  public async confirmTransaction({
    amount,
    transactionReference,
  }: {
    amount: number;
    transactionReference: string;
  }): Promise<TransactionResponse> {
    const { data } = await this.httpService.axiosRef.get<TransactionResponse>(
      `${this.config.get(
        'interswitchPaymentBaseUrl',
      )!}/gettransaction.json?merchantCode=${this.config.get('interswitchMerchantCode')}&amount=${amount}&transactionReference=${transactionReference}`,
    );
    return data;
  }

  async refreshAllPlansFromInterswitch() {
    // 1) fetch categories with billers
    // 2) filter for supported categories and supported billers
    // 3) for each biller fetch PaymentItems

    const billerPlans: BillerItem[] = [];
    const supportedCategories = Object.keys(SUPPORTED_BILL_ITEMS);
    const res = await this.getCategoriesWithBillers();
    const billers = res.BillerList.Category.reduce((billers, c) => {
      if (!supportedCategories.includes(c.Name)) return billers;

      const supportedBillerNames: string[] = SUPPORTED_BILL_ITEMS[c.Name];
      const b = supportedBillerNames.map((n) => ({
        id: c.Billers.find((b) => b.Name === n)?.Id,
        categoryId: c.Id,
        categoryName: c.Name,
      }));
      return [...billers, ...b];
    }, []);
    for (const biller of billers || []) {
      try {
        // fetch payment items for this biller
        const itemsResp = await this.getBillerPaymentItems(String(biller?.id));
        const items = itemsResp.PaymentItems ?? [];

        for (const item of items) {
          const planId = item.Id;
          const amount = Number(item.Amount); // in kobo
          const displayName = item.Name || item.Id;
          // providerMeta build — primary mapping is Interswitch for now
          const providerMeta = [
            {
              providerName: 'interswitch',
              paymentCode: item.PaymentCode,
              consumerIdField: item.ConsumerIdField,
              billerId: item.BillerId,
              billerCategoryId: item.BillerCategoryId,
            },
          ];

          let service: string = '';
          if (biller?.categoryName === 'Mobile/Recharge') {
            if (item.BillerName.includes('Data')) {
              service = 'DATA';
            } else {
              // payment item for airtime must have 0 amount type so as to allow customer to buy any amount of airtime
              // this is not the case for DATA bills
              service = 'AIRTIME';
            }
          }

          if (biller?.categoryName === 'Utility Bills') {
            service = 'ELECTRICITY';
          }

          if (biller?.categoryName === 'Cable TV Bills') {
            service = 'TV';
          }

          if (biller?.categoryName === 'Betting, Lottery and Gaming') {
            service = 'GAMING';
          }

          // If service is unknown, skip
          if (!service) continue;
          billerPlans.push({
            id: planId,
            service,
            providerName: item.BillerName,
            displayName,
            amount: amount, // kobo
            amountType: item.AmountType,
            isAmountFixed: item.IsAmountFixed ?? true,
            providerMeta,
            active: true,
          });

          // upsert normalized plan
          // await this.prisma.billerPlan.upsert({
          //   where: { id: planId },
          //   create: {
          //     id: planId,
          //     service,
          //     providerName: item.BillerName,
          //     displayName,
          //     amount: amount, // kobo
          //     isAmountFixed: item.IsAmountFixed ?? true,
          //     providerMeta,
          //     active: true,
          //   },
          //   update: {
          //     displayName,
          //     amount,
          //     isAmountFixed: item.IsAmountFixed ?? true,
          //     providerMeta,
          //     active: true,
          //   },
          // });
        }
      } catch (err) {
        this.logger.error(
          `Unable to fetch biller payment items for biller: ${biller.id}`,
          { err: err.response?.data ?? err?.message ?? err },
        );
      }
    }

    return billerPlans;
  }
}
