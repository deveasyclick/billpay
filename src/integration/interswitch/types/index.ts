export * from './biller';
export * from './category';
export * from './customer';
export * from './paymentitem';
export * from './response';

export interface PayObject {
  customerId: string;
  paymentCode: string;
  amount: number;
  requestReference: string;
}
