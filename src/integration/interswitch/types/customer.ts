export interface Customer {
  TerminalId: string;
  BillerId: number;
  PaymentCode: string;
  CustomerId: string;
  ResponseCode: string;
  FullName: string;
  Amount: number;
  AmountType: number;
  AmountTypeDescription: string;
  Surcharge: number;
}
