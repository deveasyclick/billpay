import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JOB_NAMES, QUEUE_NAMES } from 'src/common/types/bullmq';
import { Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InterSwitchService } from 'src/integration/interswitch/interswitch.service';
import { VTPassService } from 'src/integration/vtpass/vtpass.service';
import { AttemptStatus, PaymentStatus } from '@prisma/client';

@Processor(QUEUE_NAMES.PAYMENT)
export class PaymentConsumer extends WorkerHost {
  private readonly logger = new Logger(PaymentConsumer.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly interswitchService: InterSwitchService,
    private readonly vtpassService: VTPassService,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  public async process(job: Job) {
    switch (job.name) {
      case JOB_NAMES.PAYMENT_RECONCILATION: {
        await this.reconcilePayment(job.data);
        break;
      }
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  /**
   * Reconciles a pending payment by checking its status with the provider
   * @param data - Contains paymentRef and optional attemptId
   */
  private async reconcilePayment(data: {
    paymentRef: string;
    attemptId?: string;
  }) {
    const { paymentRef, attemptId } = data;
    this.logger.log(`Reconciling payment: ${paymentRef}`);

    try {
      // Fetch the payment record
      const payment =
        await this.paymentService.findPaymentByReference(paymentRef);

      if (!payment) {
        this.logger.warn(`Payment not found: ${paymentRef}`);
        return;
      }

      // Skip if payment is already in a final state
      if (
        payment.status === PaymentStatus.SUCCESS ||
        payment.status === PaymentStatus.FAILED
      ) {
        this.logger.log(
          `Payment ${paymentRef} already in final state: ${payment.status}`,
        );
        return;
      }

      // Determine which provider to query based on the last attempt or payment metadata
      // For now, we'll try both providers (Interswitch first, then VTPass)
      let reconciled = false;

      // Try Interswitch
      try {
        const interswitchResult =
          await this.interswitchService.confirmTransaction(paymentRef);

        if (interswitchResult.ResponseCodeGrouping === 'SUCCESSFUL') {
          await this.updatePaymentSuccess(
            payment.id,
            attemptId,
            interswitchResult,
          );
          this.logger.log(
            `✅ Payment ${paymentRef} reconciled successfully via Interswitch`,
          );
          reconciled = true;
        } else if (interswitchResult.ResponseCodeGrouping === 'FAILED') {
          await this.updatePaymentFailed(
            payment.id,
            attemptId,
            interswitchResult,
          );
          this.logger.log(
            `❌ Payment ${paymentRef} marked as failed via Interswitch`,
          );
          reconciled = true;
        }
      } catch (interswitchError) {
        this.logger.debug(
          `Interswitch reconciliation failed for ${paymentRef}`,
          interswitchError?.response?.data ?? interswitchError?.message,
        );
      }

      // If Interswitch didn't reconcile, try VTPass
      if (!reconciled) {
        try {
          const vtpassResult =
            await this.vtpassService.getTransaction(paymentRef);

          if (vtpassResult.status === 'delivered') {
            await this.updatePaymentSuccess(
              payment.id,
              attemptId,
              vtpassResult,
            );
            this.logger.log(
              `✅ Payment ${paymentRef} reconciled successfully via VTPass`,
            );
            reconciled = true;
          } else if (vtpassResult.status === 'failed') {
            await this.updatePaymentFailed(payment.id, attemptId, vtpassResult);
            this.logger.log(
              `❌ Payment ${paymentRef} marked as failed via VTPass`,
            );
            reconciled = true;
          }
        } catch (vtpassError) {
          this.logger.debug(
            `VTPass reconciliation failed for ${paymentRef}`,
            vtpassError?.response?.data ?? vtpassError?.message,
          );
        }
      }

      if (!reconciled) {
        this.logger.warn(
          `Payment ${paymentRef} still pending after reconciliation attempt`,
        );
        // The job will be retried based on the queue configuration
        throw new Error(
          `Unable to reconcile payment ${paymentRef} - still pending`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error reconciling payment ${paymentRef}`,
        error?.stack ?? error,
      );
      throw error;
    }
  }

  /**
   * Updates payment and attempt to SUCCESS status
   */
  private async updatePaymentSuccess(
    paymentId: string,
    attemptId: string | undefined,
    providerResponse: any,
  ) {
    await this.paymentService.updatePayment(paymentId, {
      status: PaymentStatus.SUCCESS,
      completedAt: new Date(),
    });

    if (attemptId) {
      await this.paymentService.updatePaymentAttempt(attemptId, {
        status: AttemptStatus.SUCCESS,
        responsePayload: JSON.stringify(providerResponse),
      });
    }
  }

  /**
   * Updates payment and attempt to FAILED status
   */
  private async updatePaymentFailed(
    paymentId: string,
    attemptId: string | undefined,
    providerResponse: any,
  ) {
    await this.paymentService.updatePayment(paymentId, {
      status: PaymentStatus.FAILED,
      lastError: JSON.stringify(providerResponse),
    });

    if (attemptId) {
      await this.paymentService.updatePaymentAttempt(attemptId, {
        status: AttemptStatus.FAILED,
        responsePayload: JSON.stringify(providerResponse),
      });
    }
  }
}
