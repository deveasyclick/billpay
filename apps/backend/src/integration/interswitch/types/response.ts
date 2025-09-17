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
  TransactionRef: string;
  ApprovedAmount: string;
  AdditionalInfo: Record<string, unknown>;
  ResponseCode: string;
  ResponseDescription: string;
  ResponseCodeGrouping: string;
}

export type TransactionResponse = {
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
