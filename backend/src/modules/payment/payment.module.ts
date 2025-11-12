import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from 'src/prisma.service';
import { BillsModule } from '../bills/bills.module';

@Module({
  imports: [forwardRef(() => BillsModule)],
  providers: [PaymentService, PaymentRepository, PrismaService],
  exports: [PaymentService],
})
export class PaymentModule {}
