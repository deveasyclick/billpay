import { Injectable } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import type { InterswitchPaymentWebhookData } from 'src/common/types/webhook';

@Injectable()
export class WebhookService {
  constructor(private readonly paymentService: PaymentService) {}

  async handleInterSwitchTransactions({
    event,
    data: {
      merchantCustomerId,
      merchantReference,
      amount,
      merchantCustomerName,
    },
  }: InterswitchPaymentWebhookData) {
    console.log('webhook', event);
    // TDOD: store metadata in db
    // TODO: update transaction status in db
    // TODO: send email to customer and to us
    return this.paymentService.pay({
      customerId: merchantCustomerId,
      paymentCode: merchantCustomerName, // merchantCustomerName carry payment code
      amount,
      requestReference: merchantReference,
    });
  }
}
