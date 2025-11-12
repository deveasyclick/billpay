import { Injectable } from '@nestjs/common';
import { Prisma, PaymentStatus, type Payment } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  //
  // 🧾 PAYMENTS
  //
  public async createPayment(data: Prisma.PaymentUncheckedCreateInput) {
    return this.prisma.payment.create({
      data: {
        ...data,
        amount: new Prisma.Decimal(data.amount as Prisma.Decimal.Value),
        currency: data.currency ?? 'NGN',
      },
    });
  }

  public async updatePayment(
    id: string,
    data: Pick<
      Prisma.PaymentUncheckedCreateInput,
      | 'status'
      | 'completedAt'
      | 'resolvedBillingItemId'
      | 'lastError'
      | 'duplicateOfId'
    >,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.payment.update({
        where: { id },
        data: {
          ...data,
        },
      });
    }
    return this.prisma.payment.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  public async updatePaymentStatus(
    transactionId: string,
    status: PaymentStatus,
    error?: string,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.payment.update({
        where: { id: transactionId },
        data: {
          status,
          lastError: error,
          updatedAt: new Date(),
        },
      });
    }
    return this.prisma.payment.update({
      where: { id: transactionId },
      data: {
        status,
        lastError: error,
        updatedAt: new Date(),
      },
    });
  }

  public async findPaymentByReference(
    paymentRef: string,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.payment.findUnique({
        where: { reference: paymentRef },
      });
    }
    return this.prisma.payment.findUnique({
      where: { reference: paymentRef },
    });
  }

  public async transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  public async findPayment(
    data: Pick<Partial<Payment>, 'customerId' | 'status' | 'internalCode'>,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.payment.findFirst({
        where: data,
      });
    }
    return this.prisma.payment.findFirst({
      where: data,
    });
  }

  public async scheduleRetry(transactionId: string, retryDelayMinutes = 2) {
    return this.prisma.payment.update({
      where: { id: transactionId },
      data: {
        retries: { increment: 1 },
        nextRetryAt: new Date(Date.now() + retryDelayMinutes * 60 * 1000),
      },
    });
  }

  //
  // 💳 PAYMENT ATTEMPTS
  //
  public async createPaymentAttempt(
    data: Prisma.PaymentAttemptUncheckedCreateInput,
  ) {
    return this.prisma.paymentAttempt.create({
      data: {
        paymentId: data.paymentId,
        providerId: data.providerId,
        attemptNumber: 1,
        requestPayload: data.requestPayload,
      },
    });
  }

  public async updatePaymentAttempt(
    id: string,
    data: Pick<
      Prisma.PaymentAttemptUncheckedCreateInput,
      'status' | 'requestPayload' | 'errorMessage'
    >,
  ) {
    return this.prisma.paymentAttempt.update({
      where: { id },
      data: {
        ...data,
        completedAt: new Date(),
      },
    });
  }
}
