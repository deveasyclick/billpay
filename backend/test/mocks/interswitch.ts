export const mockBillingItemsResponseData = [
  {
    id: '01',
    service: 'AIRTIME',
    providerName: 'Airtel Data Bundles',
    displayName: '30MB (Valid for 1day) #100.00',
    amount: 10000,
    amountType: 0,
    isAmountFixed: false,
    providerMeta: [
      {
        providerName: 'interswitch',
        paymentCode: '68701',
        consumerIdField: 'Phone Number',
        billerId: '687',
        billerCategoryId: '4',
      },
    ],
    active: true,
  },
  {
    id: '01',
    service: 'AIRTIME',
    providerName: 'Etisalat Recharge Top-Up',
    displayName: 'Etisalat 100',
    amount: 10099,
    amountType: 0,
    isAmountFixed: false,
    providerMeta: [
      {
        providerName: 'interswitch',
        paymentCode: '12001',
        consumerIdField: 'Phone No',
        billerId: '120',
        billerCategoryId: '4',
      },
    ],
    active: true,
  },
  {
    id: '20',
    service: 'ELECTRICITY',
    providerName: 'EKEDC NEW',
    displayName: 'Prepaid',
    amount: 10500,
    amountType: 0,
    isAmountFixed: false,
    providerMeta: [
      {
        providerName: 'interswitch',
        paymentCode: '051760120',
        consumerIdField: 'Meter No',
        billerId: '17601',
        billerCategoryId: '1',
      },
    ],
    active: true,
  },
  {
    id: '04',
    service: 'TV',
    providerName: 'DSTV Subscriptions',
    displayName: 'DSTV Confam',
    amount: 1100000,
    amountType: 0,
    isAmountFixed: true,
    providerMeta: [
      {
        providerName: 'interswitch',
        paymentCode: '051761404',
        consumerIdField: 'Smartcard Number',
        billerId: '17614',
        billerCategoryId: '2',
      },
    ],
    active: true,
  },
  {
    id: '01',
    service: 'GAMING',
    providerName: 'NairaBet - Get Altitude Nig Ltd',
    displayName: 'NairaBet Credit 1000',
    amount: 100000,
    amountType: 0,
    isAmountFixed: false,
    providerMeta: [
      {
        providerName: 'interswitch',
        paymentCode: '55501',
        consumerIdField: 'Customer Reference',
        billerId: '555',
        billerCategoryId: '28',
      },
    ],
    active: true,
  },
];
export const mockInterSwitchService = {
  getBillerPaymentItems: jest.fn().mockResolvedValue({
    PaymentItems: [{ paymentCode: 'MTN001', name: 'MTN 1GB', amount: 1000 }],
  }),
  validateCustomer: jest.fn().mockResolvedValue({
    Customers: [
      {
        Amount: 1000,
        AmountType: 2,
        AmountTypeDescription: 'Exact amount required',
      },
    ],
  }),
  confirmTransaction: jest.fn().mockResolvedValue({
    Amount: 100000,
    ResponseCode: '00',
    TransactionReference: 'ref123',
  }),
  pay: jest.fn().mockResolvedValue({
    PaymentReference: 'PR123',
    ResponseCode: '90000',
  }),
  refreshAllPlansFromInterswitch: jest
    .fn()
    .mockResolvedValue(mockBillingItemsResponseData),
};
