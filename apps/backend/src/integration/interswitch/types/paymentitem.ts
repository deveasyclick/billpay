export interface PaymentItem {
  Id: string;
  Name: string;
  BillerName: string;
  ConsumerIdField: string;
  BillerType: string;
  ItemFee: string;
  Amount: string;
  BillerId: string;
  BillerCategoryId: string;
  CurrencyCode: string;
  CurrencySymbol: string;
  IsAmountFixed: boolean;
  PaymentCode: string; // payment code
  AmountType: number;
  PaydirectItemCode: string;
}
