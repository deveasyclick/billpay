import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { BillsModule } from '../src/modules/bills/bills.module';
import { InterSwitchService } from '../src/integration/interswitch/interswitch.service';
import { ConfigModule } from '@nestjs/config';
import {
  mockBillingItemsResponseData,
  mockInterSwitchService,
} from './mocks/interswitch';
import { CacheModule } from '@nestjs/cache-manager';

// Mock InterSwitchService so tests don’t hit real API

describe('BillsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register(),
        BillsModule,
      ],
    })
      .overrideProvider(InterSwitchService)
      .useValue(mockInterSwitchService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
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

  describe.only('/bills/pay (POST)', () => {
    it('should pay a bill with paymentCode', async () => {
      const res = await request(app.getHttpServer()).post('/bills/pay').send({
        customerId: '08012345678',
        requestReference: 'ref123',
        amount: 1000,
        paymentCode: 'MTN001',
      });
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toEqual({
        customerId: '08012345678',
        amount: 1000,
        requestReference: 'ref123',
        paymentCode: 'MTN001',
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
