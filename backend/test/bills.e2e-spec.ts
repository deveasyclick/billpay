import { Test, TestingModule } from '@nestjs/testing';
import {
  Global,
  INestApplication,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { BillsModule } from 'src/modules/bills/bills.module';
import { InterSwitchService } from 'src/integration/interswitch/interswitch.service';
import { ConfigModule } from '@nestjs/config';
import {
  mockBillingItemsResponseData,
  mockInterSwitchService,
} from './mocks/interswitch';
import { CacheModule } from '@nestjs/cache-manager';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { QueueService } from '../src/modules/queue/queue.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { BillsConsumer } from '../src/modules/bills/bills.consumer';
import { VTPassService } from 'src/integration/vtpass/vtpass.service';

@Global()
@Module({
  providers: [
    {
      provide: QueueService,
      useValue: {
        addReconciliationJob: jest.fn().mockResolvedValue(undefined),
      },
    },
  ],
  exports: [QueueService],
})
class MockQueueModule {}

// Mock InterSwitchService so tests don’t hit real API

describe('BillsController (e2e)', () => {
  let app: INestApplication;

  const mockQueueService = {
    addReconciliationJob: jest.fn(),
  };

  const mockBillsConsumer = {
    process: jest.fn(),
  };

  beforeAll(async () => {
    const mockBillsConsumer = {
      process: jest.fn(),
    };

    const mockVTPassService = {
      pay: jest.fn(),
      getTransaction: jest.fn(),
      validateCustomer: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MockQueueModule,
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register(),
        PaymentModule,
        BillsModule,
      ],
      providers: [
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
        {
          provide: BillsConsumer,
          useValue: mockBillsConsumer,
        },
      ],
    })
      .overrideProvider(InterSwitchService)
      .useValue(mockInterSwitchService)
      .overrideProvider(VTPassService)
      .useValue(mockVTPassService)
      .overrideProvider(BillsConsumer)
      .useValue(mockBillsConsumer)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/bills/items (GET)', () => {
    it('should return data plans', async () => {
      const res = await request(app.getHttpServer())
        .get('/bills/items')
        .expect(200);

      expect(res.body).toEqual({
        statusCode: 200,
        message: 'Success',
        data: mockBillingItemsResponseData,
      });
    });
  });

  describe('/bills/pay (POST)', () => {
    it('should pay a bill with paymentCode', async () => {
      const res = await request(app.getHttpServer()).post('/bills/pay').send({
        customerId: '08012345678',
        requestReference: 'ref123',
        amount: 1000,
        paymentCode: 'MTN001',
      });
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toMatchObject({
        paymentRef: 'ref123',
        status: 'SUCCESS',
      });
    });

    it('should throw BadRequest if required parameters are missing', async () => {
      await request(app.getHttpServer())
        .post('/bills/pay')
        .send({
          customerId: '08012345678',
          amount: 1000,
          paymentCode: 'MTN001',
        })
        .expect(400);
    });

    it("should throw if payload amount doesn't match expected amount", async () => {
      // expected amount from mock is 100000 in kobo
      const res = await request(app.getHttpServer()).post('/bills/pay').send({
        customerId: '08012345678',
        requestReference: 'ref123',
        amount: 500, // amount in naira
        paymentCode: 'MTN001',
      });
      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toBe('Payment confirmation mismatch or failed.');
    });
  });
});
