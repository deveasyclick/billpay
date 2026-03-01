import { forwardRef, Module } from '@nestjs/common';
import { InterSwitchModule } from 'src/integration/interswitch/interswitch.module';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { CacheModule } from '@nestjs/cache-manager';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { BillRepository } from './bill.repository';
import { VTPassModule } from 'src/integration/vtpass/vtpass.module';
import { BillsConsumer } from './bills.consumer';
import { InterswitchProvider } from 'src/modules/bills/providers/interswitch.provider';
import { VTPassProvider } from 'src/modules/bills/providers/vtpass.provider';
import { BillPaymentProviderFactory } from './providers/bill-payment-provider.factory';

@Module({
  imports: [
    InterSwitchModule,
    CacheModule.register(),
    forwardRef(() => PaymentModule),
    VTPassModule,
  ],
  providers: [
    BillsService,
    BillRepository,
    BillsConsumer,
    InterswitchProvider,
    VTPassProvider,
    BillPaymentProviderFactory,
  ],
  controllers: [BillsController],
  exports: [BillsService],
})
export class BillsModule {}
