import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JOB_NAMES, QUEUE_NAMES } from 'src/common/types/bullmq';
import { Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InterSwitchService } from 'src/integration/interswitch/interswitch.service';
import { VTPassService } from 'src/integration/vtpass/vtpass.service';
import { AttemptStatus, PaymentStatus, Providers } from '@prisma/client';

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
   * @param data - Contains paymentRef and attemptId
   */
  private async reconcilePayment(data: {
    paymentRef: string;
    attemptId: string;
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

      // Fetch the payment attempt to determine which provider to query
      const attempt =
        await this.paymentService.findPaymentAttemptById(attemptId);

      if (!attempt) {
        this.logger.warn(`Payment attempt not found: ${attemptId}`);
        return;
      }

      const providerName = attempt.provider.name;
      this.logger.log(
        `Reconciling with provider: ${providerName} for payment ${paymentRef}`,
      );

      // Query the specific provider based on the attempt
      if (providerName === Providers.INTERSWITCH) {
        await this.reconcileWithInterswitch(payment.id, paymentRef, attemptId);
      } else if (providerName === Providers.VTPASS) {
        await this.reconcileWithVTPass(payment.id, paymentRef, attemptId);
      } else {
        this.logger.warn(`Unknown provider: ${providerName}`);
        throw new Error(`Unsupported provider: ${providerName}`);
      }
    } catch (error) {
      this.logger.error(
        `Error reconciling paymentRef=${paymentRef}, attemptId=${attemptId}`,
        error?.stack ?? error,
      );
      throw error;
    }
  }

  /**
   * Reconciles payment with Interswitch
   */
  private async reconcileWithInterswitch(
    paymentId: string,
    paymentRef: string,
    attemptId: string,
  ) {
    try {
      const result =
        await this.interswitchService.confirmTransaction(paymentRef);

      if (result.ResponseCodeGrouping === 'SUCCESSFUL') {
        await this.updatePaymentSuccess(paymentId, attemptId, result);
        this.logger.log(
          `✅ Payment ${paymentRef} reconciled successfully via Interswitch`,
        );
      } else if (result.ResponseCodeGrouping === 'FAILED') {
        await this.updatePaymentFailed(paymentId, attemptId, result);
        this.logger.log(
          `❌ Payment ${paymentRef} marked as failed via Interswitch`,
        );
      } else {
        // Still pending
        this.logger.warn(
          `Payment ${paymentRef} still pending on Interswitch: ${result.ResponseCodeGrouping}`,
        );
        throw new Error(
          `Payment ${paymentRef} still pending - will retry later`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Interswitch reconciliation failed for ${paymentRef}`,
        error?.response?.data ?? error?.message,
      );
      throw error;
    }
  }

  /**
   * Reconciles payment with VTPass
   */
  private async reconcileWithVTPass(
    paymentId: string,
    paymentRef: string,
    attemptId: string,
  ) {
    try {
      const result = await this.vtpassService.getTransaction(paymentRef);

      if (result.status === 'delivered') {
        await this.updatePaymentSuccess(paymentId, attemptId, result);
        this.logger.log(
          `✅ Payment ${paymentRef} reconciled successfully via VTPass`,
        );
      } else if (result.status === 'failed') {
        await this.updatePaymentFailed(paymentId, attemptId, result);
        this.logger.log(`❌ Payment ${paymentRef} marked as failed via VTPass`);
      } else {
        // Still pending
        this.logger.warn(
          `Payment ${paymentRef} still pending on VTPass: ${result.status}`,
        );
        throw new Error(
          `Payment ${paymentRef} still pending - will retry later`,
        );
      }
    } catch (error) {
      this.logger.error(
        `VTPass reconciliation failed for ${paymentRef}`,
        error?.response?.data ?? error?.message,
      );
      throw error;
    }
  }

  /**
   * Updates payment and attempt to SUCCESS status
   */
  private async updatePaymentSuccess(
    paymentId: string,
    attemptId: string,
    providerResponse: any,
  ) {
    await this.paymentService.updatePayment(paymentId, {
      status: PaymentStatus.SUCCESS,
      completedAt: new Date(),
    });

    await this.paymentService.updatePaymentAttempt(attemptId, {
      status: AttemptStatus.SUCCESS,
      responsePayload: JSON.stringify(providerResponse),
    });
  }

  /**
   * Updates payment and attempt to FAILED status
   */
  private async updatePaymentFailed(
    paymentId: string,
    attemptId: string,
    providerResponse: any,
  ) {
    await this.paymentService.updatePayment(paymentId, {
      status: PaymentStatus.FAILED,
      lastError: JSON.stringify(providerResponse),
      completedAt: new Date(),
    });

    await this.paymentService.updatePaymentAttempt(attemptId, {
      status: AttemptStatus.FAILED,
      responsePayload: JSON.stringify(providerResponse),
    });
  }
}
