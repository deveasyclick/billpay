import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from 'src/prisma.service';
import { BillsModule } from '../bills/bills.module';
import { PaymentController } from './payment.controller';

@Module({
  imports: [forwardRef(() => BillsModule)],
  providers: [PaymentService, PaymentRepository, PrismaService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
