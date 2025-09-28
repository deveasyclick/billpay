import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from 'src/prisma.service';
import { InterSwitchModule } from 'src/integration/interswitch/interswitch.module';

@Module({
  imports: [InterSwitchModule],
  providers: [PaymentService, PaymentRepository, PrismaService],
  exports: [PaymentService],
})
export class PaymentModule {}
