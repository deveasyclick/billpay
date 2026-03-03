import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/prisma.service';
import { createE2EApp } from '../infra/e2e-utils';
import { BillCategory, Providers } from '@prisma/client';

describe('PaymentController (e2e) - Transaction Isolation Demo', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const setup = await createE2EApp();
    app = setup.app;
    prismaService = setup.moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  afterEach(async () => {
    await prismaService.paymentAttempt.deleteMany();
    await prismaService.payment.deleteMany();
  });

  it('should create a payment', async () => {
    const provider = await prismaService.billingProvider.upsert({
      where: { name: Providers.VTPASS },
      update: { baseUrl: 'http://mock' },
      create: { name: Providers.VTPASS, baseUrl: 'http://mock' },
    });
    const category = await prismaService.billingCategory.upsert({
      where: { name: BillCategory.AIRTIME },
      update: {},
      create: { name: BillCategory.AIRTIME },
    });
    const biller = await prismaService.biller.upsert({
      where: { billerId: 'mtn' },
      update: { name: 'MTN' },
      create: { name: 'MTN', billerId: 'mtn' },
    });
    const billItem = await prismaService.billingItem.create({
      data: {
        internalCode: 'MTN100',
        name: 'MTN 100',
        providerId: provider.id,
        categoryId: category.id,
        billerId: biller.id,
        amount: 100,
      },
    });
    const initialCount = await prismaService.payment.count();

    const response = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .set('Content-Type', 'application/json')
      .send({
        customerId: '08012345678',
        category: BillCategory.AIRTIME,
        amount: 100,
        billingItemId: billItem.id,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.paymentReference).toBeDefined();

    const midwayCount = await prismaService.payment.count();
    expect(midwayCount).toBe(initialCount + 1);
  });
});
