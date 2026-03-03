export const mockVTPassService = {
  pay: jest.fn().mockResolvedValue({
    status: 'delivered',
    amount: 100,
    request_id: 'ref123',
  }),
  getTransaction: jest.fn(),
  validateCustomer: jest.fn(),
  getPlans: jest.fn().mockResolvedValue([
    {
      category: 'AIRTIME',
      billerName: 'MTN',
      name: 'MTN Airtime',
      amount: 0,
      amountType: 0,
      active: true,
      internalCode: 'mtn-airtime',
      paymentCode: 'mtn-airtime',
      billerId: 'mtn',
      provider: 'VTPASS',
    },
  ]),
};
