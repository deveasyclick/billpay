export interface PayObject {
  customerId: string;
  paymentCode: string;
  amount: number; // in kobo
  requestReference: string;
}

export enum ProviderResult {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}
