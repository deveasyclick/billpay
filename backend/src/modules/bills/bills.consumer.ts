import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BillsService } from './bills.service';
import { JOB_NAMES, QUEUE_NAMES } from 'src/common/types/bullmq';
import { Logger } from '@nestjs/common';

@Processor(QUEUE_NAMES.BILLS)
export class BillsConsumer extends WorkerHost {
  private readonly logger = new Logger(BillsConsumer.name);
  constructor(private readonly billsService: BillsService) {
    super();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  public async process(job: Job) {
    switch (job.name) {
      case JOB_NAMES.BILLS_SYNC_ITEMS: {
        await this.billsService.syncPlansToDB();
        break;
      }
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
