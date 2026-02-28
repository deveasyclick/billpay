import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration, { type Config } from '../../config/configuration';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config>) => [
        {
          ttl: config.get<number>('throttlerTtl', 60) * 1000,
          limit: config.get<number>('throttlerLimit', 10),
        },
      ],
    }),
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
