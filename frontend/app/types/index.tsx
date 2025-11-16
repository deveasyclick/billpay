export const Providers = {
  INTERSWITCH: "INTERSWITCH",
  VTPASS: "VTPASS",
} as const;

export type Providers = (typeof Providers)[keyof typeof Providers];

export type BillingProvider = {
  name: Providers;
  id: string;
  baseUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const Category = {
  AIRTIME: "AIRTIME",
  DATA: "DATA",
  TV: "TV",
  ELECTRICITY: "ELECTRICITY",
} as const;
export type Category = (typeof Category)[keyof typeof Category];

export type Biller = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  billerId: string;
};

export type BillingItem = {
  internalCode: string;
  provider: BillingProvider;
  biller: Biller;
  name: string;
  amount: number;
  amountType: number;
  id: string;
  category: Category;
  paymentCode: string;
  image?: string;
};

export type PayBillRequest = {
  paymentReference: string;
  billingItemId: string;
  provider?: Providers;
};

export type PayBillResponse = {
  statusCode: number;
  message: string;
  data: {
    TransactionRef: string;
    ApprovedAmount: string;
    AdditionalInfo: Record<string, unknown>;
    ResponseCode: string;
    ResponseDescription: string;
    ResponseCodeGrouping: string;
    RechargePIN?: string;
  };
};

export type CreatePaymentResponse = {
  statusCode: number;
  message: string;
  data: {
    paymentReference: string;
    id: string;
    amount: number;
    customerId: number;
    internalCode: string;
  };
};

export type CreatePaymentRequest = {
  customerId: string;
  category: Category;
  amount: number;
  plan?: string;
  billingItemId: string;
};
