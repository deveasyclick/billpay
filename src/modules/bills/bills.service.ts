import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InterSwitchService } from 'src/integration/interswitch/interswitch.service';
import type {
  TransactionResponse,
  ValidateCustomersResponse,
} from 'src/integration/interswitch/types';
import { ProviderResult } from './bills.types';
import type { PayBillDTO } from './dtos/payment';
import { validateTransaction } from './utils/validateTransaction';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PaymentService } from '../payment/payment.service';

const BILL_ITEMS_CACHE_KEY = 'billItems';
@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);
  constructor(
    private readonly interswitchService: InterSwitchService,
    private readonly paymentService: PaymentService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * 🔹 Validate customer & amount
   */
  private async validateCustomerOrThrow(
    customerId: string,
    paymentCode: string,
    amount: number,
  ): Promise<ValidateCustomersResponse> {
    const response = await this.interswitchService.validateCustomer(
      customerId,
      paymentCode,
    );

    const customer = response.Customers?.[0];
    if (!customer) {
      throw new BadRequestException('Customer validation failed');
    }

    if (
      !this.validateAmount(
        amount,
        Math.round(customer.Amount),
        customer.AmountType,
      )
    ) {
      throw new BadRequestException(
        `Invalid amount. Expected rule ${customer.AmountTypeDescription ?? 'per biller rules'}`,
      );
    }

    return response;
  }

  /**
   * 🔹 Amount validation helper
   */
  private validateAmount(
    userAmount: number,
    requiredAmount: number,
    type: number,
  ): boolean {
    const rules: Record<number, () => boolean> = {
      0: () => true, // None
      1: () => userAmount >= requiredAmount, // Minimum
      2: () => userAmount > requiredAmount, // Greater than Minimum
      3: () => userAmount <= requiredAmount, // Maximum
      4: () => userAmount < requiredAmount, // Less than Maximum
      5: () => userAmount === requiredAmount, // Exact
    };

    return rules[type]?.() ?? false;
  }

  public async processBillPayment({
    amount: amountInNaira,
    customerId,
    paymentCode,
    requestReference,
  }: PayBillDTO) {
    const amountInKobo = Math.round(amountInNaira * 100);

    // Step 1: find or create payment record
    let paymentRecord = await this.paymentService.findPaymentRecord({
      requestReference,
    });
    if (!paymentRecord) {
      paymentRecord = await this.paymentService.createPaymentRecord({
        requestReference,
        amount: amountInKobo,
        customerId,
        paymentCode,
      });
    }

    // Step 2: enforce state machine rules
    switch (paymentRecord.status) {
      case 'PAID':
        return { status: 'ALREADY_PROCESSED', data: paymentRecord };
      case 'FAILED':
        throw new ConflictException('Payment already failed, cannot retry.');
      case 'PROCESSING':
      case 'PENDING':
        // continue with processing
        break;
    }

    // Step 3: validate customer *before* attempt creation
    await this.validateCustomerOrThrow(customerId, paymentCode, amountInKobo);

    // Step 4: create provider attempt
    let attempt = await this.paymentService.createPaymentAttempt({
      paymentRecordId: paymentRecord.id,
      providerName: 'interswitch',
      isPrimary: true,
      requestBody: {
        customerId,
        paymentCode,
        amount: amountInKobo,
        requestReference,
      },
    });

    // Step 5: confirm transaction with provider
    let confirmedTx: TransactionResponse | null = null;
    try {
      confirmedTx = await this.interswitchService.confirmTransaction({
        amount: amountInKobo,
        transactionReference: requestReference,
      });
    } catch (err: any) {
      if (this.isTransactionNotFound(err)) {
        await this.paymentService.markAttemptPending(attempt.id, {
          lastError: 'Transaction not found yet',
        });
        throw new BadRequestException('Transaction not found yet');
      }
      throw err;
    }
    // Step 6: validate confirmed transaction
    if (!validateTransaction(confirmedTx, amountInKobo)) {
      throw new BadRequestException(confirmedTx.ResponseDescription);
    }

    // Step 7: call provider pay()
    const payResp = await this.interswitchService.pay({
      customerId,
      paymentCode,
      amount: amountInKobo,
      requestReference,
    });

    // Step 8: normalize response
    const providerResult = this.mapProviderResult(payResp);

    switch (providerResult) {
      case ProviderResult.SUCCESS:
        await this.paymentService.markAttemptSuccess(attempt.id, {
          providerStatus: payResp.ResponseCode,
          providerResponse: JSON.stringify(payResp),
          confirmedTransaction: confirmedTx,
          attemptReference: payResp.TransactionRef,
          requestBody: {
            customerId,
            paymentCode,
            amount: amountInKobo,
            requestReference,
          },
        });
        return { status: 'SUCCESS', pay: payResp };

      case ProviderResult.PENDING:
        await this.paymentService.markAttemptPending(attempt.id, {
          providerResponse: payResp,
          confirmedTransaction: confirmedTx,
          attemptReference: payResp.TransactionRef,
        });
        return { status: 'PENDING', pay: payResp };

      case ProviderResult.FAILED:
        await this.paymentService.markAttemptFailed(attempt.id, {
          providerResponse: payResp,
          confirmedTransaction: confirmedTx,
          attemptReference: payResp.TransactionRef,
          lastError: 'Bill payment failed',
        });
        throw new BadRequestException({
          message: 'Bill payment failed. Contact support for reconciliation.',
          details: payResp,
        });
    }
  }

  private mapProviderResult(resp: any): ProviderResult {
    if (
      resp.ResponseCode === '90000' ||
      resp.ResponseCodeGrouping === 'SUCCESSFUL'
    ) {
      return ProviderResult.SUCCESS;
    }
    if (
      resp.ResponseCode === '90009' ||
      resp.ResponseCodeGrouping === 'PENDING'
    ) {
      return ProviderResult.PENDING;
    }
    return ProviderResult.FAILED;
  }

  private isTransactionNotFound(err: any): boolean {
    return (
      err?.response?.status === 404 ||
      err?.response?.data?.ResponseCode === '30010' ||
      err?.response?.data?.ResponseCode === 'Z25' ||
      /transaction not found/i.test(String(err?.ResponseDescription ?? ''))
    );
  }

  public async fetchAllPlans() {
    let cachedItems = await this.cacheManager.get<string>(BILL_ITEMS_CACHE_KEY);
    if (cachedItems) {
      this.logger.log('served from cache');
      return JSON.parse(cachedItems);
    }

    const items =
      await this.interswitchService.refreshAllPlansFromInterswitch();
    const ttl = 60 * 60 * 24 * 1; // 1 days
    this.cacheManager.set(BILL_ITEMS_CACHE_KEY, JSON.stringify(items), ttl);
    return items;
  }
}
