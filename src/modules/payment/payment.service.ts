import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import type { PaymentAttempt, PaymentRecord } from '@prisma/client';
import { PayObject, ProviderResult } from 'src/common/types/payment';
import { InterSwitchService } from 'src/integration/interswitch/interswitch.service';
import type { PayResponse } from 'src/integration/interswitch/types';
import type { CreatePaymentDto } from './dtos/create-payment';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly interswitchService: InterSwitchService,
  ) {}
  public async pay(
    data: PayObject,
  ): Promise<{ status: ProviderResult; pay: PayResponse }> {
    const payResp = await this.interswitchService.pay({
      customerId: data.customerId,
      paymentCode: data.paymentCode,
      amount: data.amount,
      requestReference: data.requestReference,
    });

    // Step 8: normalize response
    const providerResult = this.mapProviderResult(payResp);

    switch (providerResult) {
      case ProviderResult.SUCCESS:
        return { status: ProviderResult.SUCCESS, pay: payResp };

      case ProviderResult.PENDING:
        return { status: ProviderResult.PENDING, pay: payResp };

      case ProviderResult.FAILED:
        throw new BadRequestException({
          message: 'Bill payment failed. Contact support for reconciliation.',
          details: payResp,
        });

      default:
        throw new BadRequestException({
          meessage: 'Unknown provider result',
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

  public async createPaymentRecord(data: {
    requestReference: string;
    amount: number; // kobo
    customerId: string;
    paymentCode: string;
    metadata?: any;
  }) {
    return this.paymentRepo.createPaymentRecord({
      requestReference: data.requestReference,
      amount: data.amount,
      customerId: data.customerId,
      paymentCode: data.paymentCode,
      metadata: data.metadata ?? {},
      status: 'PENDING',
    });
  }

  public async createPaymentAttempt(params: {
    paymentRecordId: string;
    providerName: string; // friendly name like 'interswitch'
    isPrimary?: boolean;
    requestBody?: any;
  }) {
    // find provider (or create if missing)
    let provider = await this.paymentRepo.findProvider(params.providerName);
    if (!provider) {
      // TODO: add providers seed
      throw new BadRequestException('Unknown provider');
    }

    // create attempt
    const attempt = await this.paymentRepo.createPaymentAttempt({
      paymentRecordId: params.paymentRecordId,
      providerId: provider.id,
      isPrimary: params.isPrimary ?? false,
      requestBody: params.requestBody,
      retries: 0,
    });

    // optimistic: set parent record to PROCESSING
    await this.paymentRepo.updatePaymentRecord(params.paymentRecordId, {
      status: 'PROCESSING',
    });

    return attempt;
  }

  public async updatePaymentAttempt(
    attemptId: string,
    data: Pick<
      PaymentAttempt,
      | 'attemptReference'
      | 'providerResponse'
      | 'confirmedTransaction'
      | 'providerStatus'
    >,
  ) {
    return this.paymentRepo.updatePaymentAttempt(attemptId, data);
  }
  public async markAttemptSuccess(
    attemptId: string,
    payload: Pick<
      PaymentAttempt,
      | 'attemptReference'
      | 'providerResponse'
      | 'providerStatus'
      | 'confirmedTransaction'
      | 'requestBody'
    >,
  ) {
    const attempt = await this.paymentRepo.updatePaymentAttempt(
      attemptId,
      payload,
    );

    await this.paymentRepo.updatePaymentRecord(attempt.paymentRecordId, {
      status: 'PAID',
    });

    return attempt;
  }

  // 4) mark attempt failure (persist error), optionally schedule fallback
  public async markAttemptFailed(
    attemptId: string,
    payload: {
      providerResponse?: any;
      lastError?: string;
      shouldFallback?: boolean;
      providerStatus?: string;
      confirmedTransaction?: any;
      attemptReference?: string;
    },
  ) {
    const attempt = await this.paymentRepo.updatePaymentAttempt(attemptId, {
      providerResponse: payload.providerResponse,
      lastError: payload.lastError ?? null,
      providerStatus: payload.providerStatus ?? 'FAILED',
      ...(payload.confirmedTransaction && {
        confirmedTransaction: payload.confirmedTransaction,
      }),
      ...(payload.attemptReference && {
        attemptReference: payload.attemptReference,
      }),
    });

    // Optionally update the parent record status to FAILED if no fallback
    if (!payload.shouldFallback) {
      await this.paymentRepo.updatePaymentRecord(attempt.paymentRecordId, {
        status: 'FAILED',
      });
    }

    return attempt;
  }

  public async markAttemptPending(
    attemptId: string,
    payload: {
      providerResponse?: any;
      lastError?: string;
      providerStatus?: string;
      confirmedTransaction?: any;
      attemptReference?: string;
    },
  ) {
    const attempt = await this.paymentRepo.updatePaymentAttempt(attemptId, {
      providerResponse: payload.providerResponse,
      lastError: payload.lastError ?? null,
      providerStatus: payload.providerStatus ?? 'PENDING',
      ...(payload.confirmedTransaction && {
        confirmedTransaction: payload.confirmedTransaction,
      }),
      ...(payload.attemptReference && {
        attemptReference: payload.attemptReference,
      }),
    });

    await this.paymentRepo.updatePaymentRecord(attempt.paymentRecordId, {
      status: 'PENDING',
    });

    return attempt;
  }

  public async findPaymentRecord(
    where: Pick<PaymentRecord, 'requestReference'>,
  ) {
    return this.paymentRepo.findPaymentRecord(where);
  }

  private async findProvider(name: string) {
    return this.paymentRepo.findProvider(name);
  }

  public async createPayment(data: CreatePaymentDto) {
    const record = await this.paymentRepo.createPaymentRecord({
      requestReference: uuid(),
      amount: data.amount,
      customerId: data.customerId,
      paymentCode: data.paymentCode,
      metadata: {},
      status: 'PENDING',
    });
    let provider = await this.paymentRepo.findProvider('interswitch');
    if (!provider) {
      throw new BadRequestException('Unknown provider');
    }
    const attempt = await this.paymentRepo.createPaymentAttempt({
      paymentRecordId: record.id,
      providerId: provider.id,
      isPrimary: true,
      requestBody: JSON.stringify(data),
      retries: 0,
    });

    return { record, attempt };
  }
}
