import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOB_NAMES, QUEUE_NAMES } from 'src/common/types/bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAMES.RECONCILIATION) private reconciliationQueue: Queue,
  ) {}

  public async addReconciliationJob({
    paymentRef,
    attemptId,
    itemId,
  }: {
    paymentRef: string;
    attemptId: string;
    itemId: string;
  }) {
    await this.reconciliationQueue.add(
      JOB_NAMES.RECONCILE_PAYMENT,
      { paymentRef, attemptId },
      {
        delay: 60_000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 30000 },
        removeOnComplete: true,
        removeOnFail: true,
        jobId: paymentRef, // to avoid duplicate scheduling
      },
    );
  }
}
