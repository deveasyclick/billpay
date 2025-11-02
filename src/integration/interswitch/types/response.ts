import type { Category } from './category';
import type { Customer } from './customer';
import type { PaymentItem } from './paymentitem';

interface BillerList {
  Count: number;
  Category: Category[];
}

export interface BillerCategoryResponse {
  BillerList: BillerList;
  ResponseCode: string;
  ResponseCodeGrouping: string;
}

export interface BillerCategoriesResponse {
  BillerCategories: Category[];
  ResponseCode: string;
  ResponseCodeGrouping: string;
}

export interface BillersWithCategoriesResponse {
  BillerList: BillerList;
  ResponseCode: string;
  ResponseCodeGrouping: string;
}

export interface PaymentItemsResponse {
  PaymentItems: PaymentItem[];
  ResponseCode: string;
  ResponseCodeGrouping: string;
}

export interface ValidateCustomersResponse {
  Customers: Customer[];
  ResponseCode: string;
  ResponseCodeGrouping: string;
}

export interface PayResponse {
  paymentRef: string;
  amount: number;
  metadata: Record<string, any>;
  status: string;
}

export type ConfirmCardPaymentResponse = {
  Amount: number;
  CardNumber: string;
  MerchantReference: string;
  PaymentReference: string;
  RetrievalReferenceNumber: string;
  SplitAccounts: any[];
  TransactionDate: string; // ISO datetime string
  ResponseCode: string;
  ResponseDescription: string;
  AccountNumber: string;
};

export type TransactionResponse = {
  TransactionRef: string;
  ApprovedAmount: string;
  AdditionalInfo: Record<string, string>;
  ResponseCode: string;
  ResponseDescription: string;
  ResponseCodeGrouping: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
};

type BillPayment = {
  Biller: string;
  CustomerId1: string;
  PaymentTypeName: string;
  paymentTypeCode: string;
  BillerId: string;
  NarrationStreet: string;
  NarrationCity: string;
  ReceivingInstitutionId: string;
  ServiceProvider: string;
  ServiceName: string;
  Payee: string;
};

export type ConfirmTransactionResponse = {
  TransactionId: number;
  ServiceProviderId: string;
  ServiceCode: string;
  ServiceName: string;
  TransactionRef: string;
  RequestReference: string;
  Status: string;
  TransactionSet: string;
  TransactionResponseCode: string;
  PaymentDate: string;
  Amount: string;
  Surcharge: string;
  CurrencyCode: string;
  Customer: string;
  CustomerMobile: string;
  BillPayment: BillPayment;
  ResponseCode: string;
  ResponseCodeGrouping: string;
};
