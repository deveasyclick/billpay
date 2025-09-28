export type InterswitchPaymentWebhookData = {
  event: string; // TRANSACTION.COMPLETED
  uuid: string;
  timestamp: number;
  data: {
    remittanceAmount: number;
    bankCode: string;
    amount: number;
    paymentReference: string;
    channel: string;
    splitAccounts: any[];
    retrievalReferenceNumber: string;
    transactionDate: number;
    accountNumber: string | null;
    responseCode: string;
    token: string | null;
    responseDescription: string;
    paymentId: number;
    merchantCustomerId: string;
    escrow: boolean;
    merchantReference: string;
    currencyCode: string;
    merchantCustomerName: string; // carry payment code
    cardNumber: string;
    customerId: string;
  };
};
