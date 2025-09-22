export type BillingItem = {
  id: string;
  service: string;
  providerName: string;
  displayName: string;
  amount: number;
  amountType: number;
  isAmountFixed: boolean;
  providerMeta: {
    providerName: string;
    paymentCode: string;
    consumerIdField: string;
    billerId: string;
    billerCategoryId: string;
  }[];
  active: boolean;
};
