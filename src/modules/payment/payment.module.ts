import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  providers: [PaymentService, PaymentRepository, PrismaService],
  controllers: [],
  exports: [PaymentService],
})
export class PaymentModule {}
