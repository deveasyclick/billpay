import { Providers } from '.';

export type ValidateCustomerProps = {
    customerId: string;
    paymentCode: string;
    provider: Providers;
};

export type ValidateCustomerResponse = {
    statusCode: number;
    message: string;
    data: Customer;
};

export interface Customer {
    TerminalId: string;
    BillerId: number;
    PaymentCode: string;
    CustomerId: string;
    ResponseCode: string;
    ResponseDescription: string;
    FullName: string;
    Amount: number;
    AmountType: number;
    AmountTypeDescription: string;
    Surcharge: number;
}
