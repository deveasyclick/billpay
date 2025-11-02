import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PayObject } from 'src/common/types/payment';
import { Config } from 'src/config/configuration';
import { INTERSWITCH_BASIC_TOKEN_KEY } from './interswitch.constants';
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
}
