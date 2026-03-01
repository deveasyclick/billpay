import { Inject, Injectable, Logger } from '@nestjs/common';
import { AttemptStatus, Payment, PaymentStatus, Prisma } from '@prisma/client';
import { IBillPaymentProvider } from 'src/common/interfaces/bill-payment-provider.interface';
import { InterSwitchService } from 'src/integration/interswitch/interswitch.service';
import { Customer, PayResponse } from 'src/integration/interswitch/types';
import { PaymentService } from 'src/modules/payment/payment.service';
import { QueueService } from 'src/modules/queue/queue.service';

@Injectable()
export class InterswitchProvider implements IBillPaymentProvider {
  private readonly logger = new Logger(InterswitchProvider.name);

  constructor(
    private readonly interswitchService: InterSwitchService,
    private readonly paymentService: PaymentService,
    @Inject(QueueService) private readonly queueService: QueueService,
  ) {}

  async executePayment(
    item: Prisma.BillingItemGetPayload<{
      include: { provider: true; category: true; biller: true };
    }>,
    payment: Pick<
      Payment,
      'reference' | 'amount' | 'id' | 'customerId' | 'plan'
    >,
  ): Promise<PayResponse> {
    const { provider, ...rest } = item;

    // Step 1: Create payment attempt
    const attempt = await this.paymentService.createPaymentAttempt({
      providerId: provider.id,
      requestPayload: JSON.stringify({
        amount: payment.amount,
        billersCode: rest.paymentCode,
        billingItemId: rest.id,
      }),
      paymentId: payment.id,
    });

    try {
      // Step 3: call provider pay()
      let payResp = await this.interswitchService.pay({
        customerId: payment.customerId,
        paymentCode: item.paymentCode!,
        amount: Number(payment.amount),
        requestReference: payment.reference,
      });

      await this.paymentService.updatePaymentAttempt(attempt.id, {
        status: AttemptStatus.PENDING_CONFIRMATION,
        responsePayload: JSON.stringify(payResp),
      });

      // 🕒 Retry loop for getTransaction
      const maxRetries = 5; // total retries
      const delayMs = 3000; // 3 seconds per retry

      for (let attemptCount = 0; attemptCount < maxRetries; attemptCount++) {
        try {
          if (payResp.ResponseCodeGrouping === 'SUCCESSFUL') {
            await this.paymentService.updatePaymentAttempt(attempt.id, {
              status: AttemptStatus.SUCCESS,
              responsePayload: JSON.stringify(payResp),
            });

            return {
              paymentRef: payment.reference,
              amount: Number(payResp.ApprovedAmount),
              status: PaymentStatus.SUCCESS,
              metadata: payResp.AdditionalInfo,
            };
          }

          if (payResp.ResponseCodeGrouping === PaymentStatus.FAILED) {
            await this.paymentService.updatePaymentAttempt(attempt.id, {
              status: PaymentStatus.FAILED,
              responsePayload: JSON.stringify(payResp),
            });
            throw new Error('interswitch payment attempt failed');
          }

          // Only retry if still pending
          if (payResp.ResponseCodeGrouping === PaymentStatus.PENDING) {
            if (attemptCount < maxRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
              const confirmedTx =
                await this.interswitchService.confirmTransaction(
                  payment.reference,
                );
              payResp = {
                TransactionRef: confirmedTx.TransactionRef,
                ApprovedAmount: confirmedTx.Amount,
                AdditionalInfo: confirmedTx.BillPayment,
                ResponseCode: confirmedTx.ResponseCode,
                ResponseCodeGrouping: confirmedTx.ResponseCodeGrouping as
                  | 'SUCCESSFUL'
                  | 'FAILED'
                  | 'PENDING',
                ResponseDescription: '',
              };
              continue;
            }
          }

          // Exit loop if status is not pending
          break;
        } catch (err) {
          // confirm transaction throws error if transaction not found
          if (
            err.response?.data?.ResponseCodeGrouping === PaymentStatus.FAILED
          ) {
            await this.paymentService.updatePaymentAttempt(attempt.id, {
              status: PaymentStatus.FAILED,
              responsePayload: JSON.stringify(payResp),
            });
            throw new Error('interswitch payment attempt failed');
          }

          this.logger.error(
            'Interswitch payment confirmation failed',
            err?.response?.data ?? err,
          );
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
          status: payResp.ResponseCodeGrouping,
          message: 'Transaction pending confirmation',
        },
      };
    } catch (err) {
      await this.paymentService.updatePaymentAttempt(attempt.id, {
        status: PaymentStatus.FAILED,
      });
      throw err;
    }
  }

  async validateCustomer(
    customerId: string,
    paymentCode: string,
  ): Promise<Customer> {
    const response = await this.interswitchService.validateCustomer(
      customerId,
      paymentCode,
    );
    return response.Customers?.[0] ?? ({} as Customer);
  }
}
