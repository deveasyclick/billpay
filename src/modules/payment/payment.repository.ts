import { Injectable } from '@nestjs/common';
import {
  Prisma,
  type PaymentAttempt,
  type PaymentRecord,
} from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createPaymentRecord(pr: Prisma.PaymentRecordCreateInput) {
    return this.prisma.paymentRecord.create({
      data: { ...pr, metadata: pr.metadata ?? {} },
    });
  }

  public async createPaymentAttempt(
    pa: Pick<
      PaymentAttempt,
      'paymentRecordId' | 'providerId' | 'isPrimary' | 'requestBody' | 'retries'
    >,
  ) {
    return this.prisma.paymentAttempt.create({
      data: {
        ...pa,
        requestBody: pa.requestBody ?? {},
      },
    });
  }

  public async createProvider(p: Prisma.ProviderCreateInput) {
    return this.prisma.provider.create({
      data: p,
    });
  }

  public async updatePaymentRecord(
    id,
    pr: Partial<Omit<PaymentRecord, 'metadata'>>,
  ) {
    return this.prisma.paymentRecord.update({
      where: { id },
      data: pr,
    });
  }

  public async updatePaymentAttempt(
    id: string,
    pa: Partial<
      Pick<
        PaymentAttempt,
        | 'attemptReference'
        | 'providerResponse'
        | 'confirmedTransaction'
        | 'providerStatus'
        | 'lastError'
      >
    >,
  ) {
    const { providerResponse, confirmedTransaction } = pa;
    return this.prisma.paymentAttempt.update({
      where: { id },
      data: {
        ...pa,
        providerResponse: providerResponse ?? {},
        confirmedTransaction: confirmedTransaction ?? {},
        retries: { increment: 1 },
      },
    });
  }

  public async findProvider(name: string) {
    return this.prisma.provider.findUnique({
      where: { name },
    });
  }

  public async findPaymentRecord(
    where: Pick<PaymentRecord, 'requestReference'>,
  ) {
    return this.prisma.paymentRecord.findFirst({
      where,
    });
  }

  public async findUniquePaymentRecord(
    where: Pick<PaymentRecord, 'requestReference' | 'id'>,
  ) {
    return this.prisma.paymentRecord.findUnique({
      where,
    });
  }
}
