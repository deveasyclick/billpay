import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from 'src/common/types/bullmq';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('redisUrl'),
          keyPrefix: 'billpay',
        },
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000, // 1 sec
          },
          removeOnComplete: 5,
        },
      }),
      inject: [ConfigService],
    }),

    BullModule.registerQueue({
      name: QUEUE_NAMES.PAYMENT,
    }),
    BullModule.registerQueue({
      name: QUEUE_NAMES.BILLS,
    }),
  ],
  controllers: [],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
