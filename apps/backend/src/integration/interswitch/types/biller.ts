export interface Biller {
  Type: string;
  Id: number;
  Name: string;
  ShortName: string;
  CurrencyCode: string;
  CurrencySymbol: string;
  CategoryId: number;
  CategoryName: string;
  SupportEmail?: string;
  AmountType: number;
}
