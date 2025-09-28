import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BillsModule } from './modules/bills/bills.module';
import configuration from './config/configuration';
import { validateConfig } from './config/config.validation';
import { WebhookModule } from './modules/webhook/webhook.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateConfig,
    }),
    BillsModule,
    WebhookModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
