import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from 'src/prisma.service';
import { BillsModule } from '../bills/bills.module';
import { PaymentController } from './payment.controller';
import { PaymentConsumer } from './payment.consumer';
import { InterSwitchModule } from 'src/integration/interswitch/interswitch.module';
import { VTPassModule } from 'src/integration/vtpass/vtpass.module';

@Module({
  imports: [forwardRef(() => BillsModule), InterSwitchModule, VTPassModule],
  providers: [
    PaymentService,
    PaymentRepository,
    PrismaService,
    PaymentConsumer,
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
