import { Module } from '@nestjs/common';
import { InterSwitchModule } from 'src/integration/interswitch/interswitch.module';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { CacheModule } from '@nestjs/cache-manager';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [InterSwitchModule, CacheModule.register(), PaymentModule],
  providers: [BillsService],
  controllers: [BillsController],
  exports: [BillsService],
})
export class BillsModule {}
