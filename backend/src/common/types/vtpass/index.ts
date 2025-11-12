import type { BillCategory } from '@prisma/client';

interface CommissionDetails {
  amount: number | null;
  rate: string;
  rate_type: string;
  computation_type: string;
}

// Represents a single variation under a service
export interface VTPassVariation {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string; // often "Yes" or "No"
}

// Represents the top-level VTpass API response
export interface GetVTPassVariationsResponse {
  response_description: string;
  content: {
    ServiceName: string;
    serviceID: string;
    convinience_fee: string;
    variations: VTPassVariation[];
  };
}

export interface VTPassCategory {
  identifier: string; // airtime, data, tv-subscription, electricity-bill, education, other-services, insurance
  name: string;
}

export interface GetVTPassCategoryResponse {
  response_description: string;
  content: VTPassCategory[];
}

export interface VTPassService {
  serviceID: string; // e.g airtel-data
  name: string; // e.g "Airtel Data"
  minimium_amount: string; // e.g "1"
  maximum_amount: string; // e.g "1000000"
  convinience_fee: string; // e.g "0 %"
  product_type: string; // e.g "fix"
  image: string; // e.g "https://sandbox.vtpass.com/resources/products/200X200/Airtel-Data.jpg";
}

export interface GetVTPassServiceResponse {
  response_description: string;
  content: VTPassService[];
}
export interface VTPassTransaction {
  status: string;
  product_name: string;
  unique_element: string;
  unit_price: string;
  quantity: number;
  service_verification: string | null;
  channel: string;
  commission: number;
  total_amount: number;
  discount: number | null;
  type: string;
  email: string;
  phone: string;
  name: string | null;
  convinience_fee: number;
  amount: string;
  platform: string;
  method: string;
  transactionId: string;
  commission_details: CommissionDetails;
}

export interface VTPassTransactionResponse {
  code: string;
  content: {
    transactions: VTPassTransaction;
  };
  response_description: string;
  requestId: string;
  amount: number;
  transaction_date: string; // ISO date string
  purchased_code: string;
}

export interface VTPassCustomer {
  Customer_Name: string;
  Status: string;
  Due_Date: string; // ISO date string
  Customer_Number: string;
  Customer_Type: string;
  commission_details: CommissionDetails;
}

export interface VTPassValidateCustomerResponse {
  code: string;
  content: VTPassCustomer | { error: string };
  response_description: string;
}

export interface VTPassVerifyCustomerPayload {
  billersCode: string; // meter no
  serviceID: string; // ikeja-electric
}

export interface VTPassVerifyMeterNoPayload
  extends VTPassVerifyCustomerPayload {
  type: string; // prepaid or postpaid
}

interface VTPassBuyPayload {
  request_id: string;
  serviceID: string;
  phone: string;
}

export interface VTPassBuyAirtimePayload extends VTPassBuyPayload {
  amount: number;
}

export interface VTPassBuyDataPayload extends VTPassBuyPayload {
  variation_code: string;
  billersCode: string;
  amount?: number;
  quantity?: number; // e.g 1
}

export interface VTPassBuyTVPayload extends VTPassBuyPayload {
  variation_code: string;
  billersCode: string;
  amount?: number;
  subscription_type: string; // change | renew
  quantity?: number; // e.g 1
}

export interface VTPassBuyElectricityPayload extends VTPassBuyPayload {
  variation_code: string; // prepai or postpaid
  billersCode: string;
  amount: number;
}

export type PayWithVtPassPayload = {
  category: BillCategory;
  request_id: string;
  serviceID: string;
  phone: string;
  amount?: number;
  variation_code?: string;
  billersCode: string;
  subscription_type?: string; // change | renew
  quantity?: number; // e.g
  providerId: string;
  paymentId: string; // db payment id
};

export type CategoryPayloadMap = {
  AIRTIME: VTPassBuyAirtimePayload;
  DATA: VTPassBuyDataPayload;
  TV: VTPassBuyTVPayload;
  ELECTRICITY: VTPassBuyElectricityPayload;
};

export type VTPassPayPayload<
  C extends keyof CategoryPayloadMap = keyof CategoryPayloadMap,
> = CategoryPayloadMap[C];
