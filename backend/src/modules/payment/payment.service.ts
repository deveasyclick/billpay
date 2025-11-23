import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Payment, Prisma } from '@prisma/client';
import { generateRequestId } from 'src/common/utils/generateRequestId';
import { BillsService } from '../bills/bills.service';
import { CreatePaymentDto } from './dtos/create-payment';
import { PaymentRepository } from './payment.repository';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    @Inject(forwardRef(() => BillsService))
    private readonly billService: BillsService,
  ) {}

  public async createPayment(dto: CreatePaymentDto) {
    const billItem = await this.billService.findItemById(dto.billingItemId);
    if (!billItem) {
      throw new NotFoundException('Billing item not found!');
    }
    const reference = generateRequestId();
    return this.paymentRepo.createPayment({
      reference,
      amount: dto.amount,
      currency: 'NGN',
      customerId: dto.customerId,
      internalCode: billItem.internalCode,
      initialBillingItemId: billItem.id,
      category: dto.category,
      plan: dto.plan,
    });
  }

  public async updatePayment(
    paymentId: string,
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
    return this.paymentRepo.updatePayment(paymentId, data, tx);
  }

  public async findPaymentByReference(
    reference: string,
    tx?: Prisma.TransactionClient,
  ) {
    return this.paymentRepo.findPaymentByReference(reference, tx);
  }

  public async createPaymentAttempt(
    data: Pick<
      Prisma.PaymentAttemptUncheckedCreateInput,
      'paymentId' | 'providerId' | 'requestPayload'
    >,
  ) {
    return this.paymentRepo.createPaymentAttempt({
      paymentId: data.paymentId,
      providerId: data.providerId,
      attemptNumber: 1,
      requestPayload: data.requestPayload,
    });
  }

  public async updatePaymentAttempt(
    id: string,
    data: Pick<
      Prisma.PaymentAttemptUncheckedCreateInput,
      'status' | 'responsePayload' | 'errorMessage'
    >,
  ) {
    return this.paymentRepo.updatePaymentAttempt(id, data);
  }

  public async transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.paymentRepo.transaction(fn);
  }

  public async findPayment(
    data: Pick<
      Partial<Payment>,
      'customerId' | 'status' | 'internalCode' | 'reference'
    >,
    tx?: Prisma.TransactionClient,
  ) {
    return this.paymentRepo.findPayment(data, tx);
  }

  public async findPaymentAttemptById(id: string) {
    return this.paymentRepo.findPaymentAttemptById(id);
  }
}
