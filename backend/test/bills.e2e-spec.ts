import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from './e2e-utils';

import { BillsConsumer } from 'src/modules/bills/bills.consumer';
import { QueueService } from 'src/modules/queue/queue.service';
import { InterSwitchService } from 'src/integration/interswitch/interswitch.service';
import { VTPassService } from 'src/integration/vtpass/vtpass.service';
import { mockInterSwitchService } from './mocks/interswitch';
import { BillsService } from 'src/modules/bills/bills.service';

describe('BillsController (e2e)', () => {
  let app: INestApplication;

  const mockQueueService = { addReconciliationJob: jest.fn() };
  const mockBillsConsumer = { process: jest.fn() };
  const mockVTPassService = {
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

  let billsService: BillsService;

  beforeAll(async () => {
    const setup = await createE2EApp([
      { provide: QueueService, useValue: mockQueueService },
      { provide: BillsConsumer, useValue: mockBillsConsumer },
      { provide: InterSwitchService, useValue: mockInterSwitchService },
      { provide: VTPassService, useValue: mockVTPassService },
    ]);

    app = setup.app;

    billsService = setup.moduleFixture.get<BillsService>(BillsService);
    await billsService.syncPlansToDB();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  // 3️⃣ GET /bills/items
  describe('/bills/items (GET)', () => {
    it('should return data plans', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/bills/items')
        .expect(200);

      expect(res.body.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            internalCode: 'mtn-airtime',
            provider: expect.objectContaining({ name: 'VTPASS' }),
          }),
        ]),
      );
    });
  });

  // 4️⃣ POST /bills/pay
  describe('/bills/pay (POST)', () => {
    let testBiller: any;
    let testPayment: any;

    beforeEach(async () => {
      const items = await billsService.getBillingItems();
      testBiller = items.find((i) => i.internalCode === 'mtn-airtime');

      // Create a payment first
      const paymentRes = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .send({
          customerId: '08012345678',
          category: 'AIRTIME',
          amount: 100,
          billingItemId: testBiller.id,
        });
      testPayment = paymentRes.body.data;
    });

    it('should pay a bill with paymentReference and billingItemId', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/bills/pay')
        .send({
          paymentReference: testPayment.paymentReference,
          billingItemId: testBiller.id,
        });

      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toMatchObject({
        paymentRef: testPayment.paymentReference,
        status: 'SUCCESS',
      });
    });

    it('should throw BadRequest if required parameters are missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/bills/pay')
        .send({
          paymentReference: testPayment.paymentReference,
        })
        .expect(400);
    });

    it("should NOT throw even if payload amount doesn't match expected amount (Service doesn't validate)", async () => {
      const mismatchPaymentRes = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .send({
          customerId: '08012345678',
          category: 'AIRTIME',
          amount: 50.0,
          billingItemId: testBiller.id,
        });
      const mismatchPayment = mismatchPaymentRes.body.data;

      const res = await request(app.getHttpServer())
        .post('/api/v1/bills/pay')
        .send({
          paymentReference: mismatchPayment.paymentReference,
          billingItemId: testBiller.id,
        });

      expect(res.body.statusCode).toBe(200);
    });
  });
});
