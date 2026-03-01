import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  AttemptStatus,
  BillCategory,
  Payment,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { IBillPaymentProvider } from 'src/common/interfaces/bill-payment-provider.interface';
import { VTPassService } from 'src/integration/vtpass/vtpass.service';
import { Customer, PayResponse } from 'src/integration/interswitch/types';
import { PaymentService } from 'src/modules/payment/payment.service';
import { QueueService } from 'src/modules/queue/queue.service';
import { VTPassPayPayload } from 'src/common/types/vtpass';

@Injectable()
export class VTPassProvider implements IBillPaymentProvider {
  private readonly logger = new Logger(VTPassProvider.name);

  constructor(
    private readonly vtpassService: VTPassService,
    private readonly paymentService: PaymentService,
    @Inject(QueueService) private readonly queueService: QueueService,
  ) {}

  private buildVtpassPayload(
    payment: Pick<Payment, 'reference' | 'customerId' | 'amount' | 'plan'>,
    item: Prisma.BillingItemGetPayload<{
      include: { provider: true; category: true; biller: true };
    }>,
  ): VTPassPayPayload {
    const defaultPhoneNumber = '+2348111111111';
    switch (item.category.name) {
      case 'AIRTIME':
        return {
          request_id: payment.reference,
          serviceID: item.biller.billerId,
          phone: payment.customerId,
          amount: Number(payment.amount),
        };

      case 'DATA':
        return {
          request_id: payment.reference,
          serviceID: item.biller.billerId,
          phone: payment.customerId,
          variation_code: item.paymentCode!,
          billersCode: defaultPhoneNumber,
        };

      case 'TV':
        return {
          request_id: payment.reference,
          serviceID: item.biller.billerId,
          phone: defaultPhoneNumber,
          variation_code: item.paymentCode!,
          billersCode: payment.customerId,
          subscription_type: 'change',
        };

      case 'ELECTRICITY':
        return {
          request_id: payment.reference,
          serviceID: item.biller.billerId,
          phone: defaultPhoneNumber,
          variation_code: payment.plan!,
          billersCode: payment.customerId,
          amount: Number(payment.amount),
        };

      default:
        throw new BadRequestException(
          `Unsupported bill category: ${item.category.name}`,
        );
    }
  }

  async executePayment(
    item: Prisma.BillingItemGetPayload<{
      include: { provider: true; category: true; biller: true };
    }>,
    payment: Pick<
      Payment,
      'reference' | 'amount' | 'id' | 'customerId' | 'plan'
    >,
  ): Promise<PayResponse> {
    const attempt = await this.paymentService.createPaymentAttempt({
      providerId: item.provider.id,
      requestPayload: JSON.stringify({
        amount: payment.amount,
        billersCode: item.paymentCode,
        billingItemId: item.id,
      }),
      paymentId: payment.id,
    });

    try {
      const vtpassPayload: VTPassPayPayload = this.buildVtpassPayload(
        payment,
        item,
      );

      let tx = await this.vtpassService.pay(vtpassPayload);
      await this.paymentService.updatePaymentAttempt(attempt.id, {
        status: AttemptStatus.PENDING_CONFIRMATION,
        responsePayload: JSON.stringify(tx),
      });

      // 🕒 Retry loop for getTransaction
      const maxRetries = 3; // total retries
      const delayMs = 3000; // 3 seconds per retry

      for (let attemptCount = 0; attemptCount < maxRetries; attemptCount++) {
        try {
          if (tx.status === 'delivered') {
            await this.paymentService.updatePaymentAttempt(attempt.id, {
              status: AttemptStatus.SUCCESS,
              responsePayload: JSON.stringify(tx),
            });
            return {
              paymentRef: payment.reference,
              amount: Number(tx.amount),
              status: PaymentStatus.SUCCESS,
              metadata: { rechargePin: (tx as any).extras },
            };
          }

          if (tx.status === 'failed') {
            await this.paymentService.updatePaymentAttempt(attempt.id, {
              status: PaymentStatus.FAILED,
              responsePayload: JSON.stringify(tx),
            });
            throw new Error('vtpass payment attempt failed');
          }

          // Only retry if still pending
          if (tx.status === 'pending') {
            if (attemptCount < maxRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
              tx = await this.vtpassService.getTransaction(payment.reference);
              continue;
            }
          }

          // Exit loop if status is not pending
          break;
        } catch (err) {
          this.logger.error('Error while trying to confirm payment', err);
        }
      }

      // Keep the status as pending_confirmation if transaction status is unknown so we can retry later
      await this.queueService.addReconciliationJob({
        paymentRef: payment.reference,
        attemptId: attempt.id,
      });

      return {
        paymentRef: payment.reference,
        amount: Number(payment.amount),
        status: PaymentStatus.PENDING,
        metadata: {
          status: tx.status,
          message: 'Transaction pending confirmation',
        },
      };
    } catch (e) {
      await this.paymentService.updatePaymentAttempt(attempt.id, {
        status: PaymentStatus.FAILED,
        errorMessage: JSON.stringify(e),
      });
      throw e;
    }
  }

  async validateCustomer(
    customerId: string,
    paymentCode: string,
    type?: string,
  ): Promise<Customer> {
    const response = await this.vtpassService.validateCustomer({
      billersCode: customerId,
      serviceID: paymentCode,
      ...(type && { type }),
    });

    return {
      TerminalId: '',
      BillerId: 0,
      PaymentCode: paymentCode,
      CustomerId: customerId,
      FullName: response.Customer_Name,
      Amount: response.commission_details.amount ?? 0,
      AmountType: 0,
      AmountTypeDescription: '',
      Surcharge: 0,
      ResponseCode: '000',
    };
  }
}
