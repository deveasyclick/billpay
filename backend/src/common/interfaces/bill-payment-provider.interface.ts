import { Payment, Prisma } from '@prisma/client';
import { Customer, PayResponse } from '../../integration/interswitch/types';

export interface IBillPaymentProvider {
  executePayment(
    item: Prisma.BillingItemGetPayload<{
      include: { provider: true; category: true; biller: true };
    }>,
    payment: Pick<
      Payment,
      'reference' | 'amount' | 'id' | 'customerId' | 'plan'
    >,
  ): Promise<PayResponse>;

  validateCustomer(
    customerId: string,
    paymentCode: string,
    type?: string,
  ): Promise<Customer>;
}
