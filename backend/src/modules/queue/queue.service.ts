import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOB_NAMES, QUEUE_NAMES } from 'src/common/types/bullmq';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  constructor(
    @InjectQueue(QUEUE_NAMES.PAYMENT) private paymentQueue: Queue,
    @InjectQueue(QUEUE_NAMES.BILLS)
    private billsQueue: Queue,
  ) {}

  async onModuleInit() {
    // register repeatable jobs on startup
    await this.addSyncPaymentItemsJob();
  }

  public async addReconciliationJob({
    paymentRef,
    attemptId,
  }: {
    paymentRef: string;
    attemptId: string;
  }) {
    await this.paymentQueue.add(
      JOB_NAMES.PAYMENT_RECONCILATION,
      { paymentRef, attemptId },
      {
        delay: 60000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 30000 },
        removeOnComplete: true,
        removeOnFail: true,
        jobId: paymentRef, // to avoid duplicate scheduling
      },
    );
  }

  public async addSyncPaymentItemsJob() {
    await this.billsQueue.add(
      JOB_NAMES.BILLS_SYNC_ITEMS,
      {},
      {
        repeat: {
          pattern: '0 2 * * *', // every day at 2AM
        },
        attempts: 3,
        backoff: { type: 'exponential', delay: 30000 },
        removeOnComplete: true,
        removeOnFail: true,
        jobId: JOB_NAMES.BILLS_SYNC_ITEMS, // to avoid duplicate scheduling
      },
    );

    this.logger.log('Repeat sync payment items job scheduled');
  }
}
