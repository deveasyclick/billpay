import { Injectable } from '@nestjs/common';
import { Prisma, type BillingItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillRepository {
  constructor(private readonly prisma: PrismaService) {}
  // ============================================================
  // BILLING PROVIDERS
  // ============================================================

  public async findActiveProviders() {
    return this.prisma.billingProvider.findMany({ where: { isActive: true } });
  }

  // ============================================================
  // BILLING CATEGORIES
  // ============================================================

  public async findCategories() {
    return this.prisma.billingCategory.findMany({});
  }

  // ============================================================
  // BILLERS (brands like MTN, DSTV, Ikeja Electric)
  // ============================================================

  public async findOrCreateBiller(name: string, id: string) {
    return this.prisma.biller.upsert({
      where: { billerId: id },
      update: {},
      create: { name, billerId: id },
    });
  }

  public async createManyBillers(
    billers: { name: string; billerId: string }[],
  ) {
    return this.prisma.biller.createMany({
      data: billers,
      skipDuplicates: true,
    });
  }

  public async findAllBillers() {
    return this.prisma.biller.findMany({
      select: { id: true, billerId: true },
    });
  }

  public async findBillersByIds(ids: string[]) {
    return this.prisma.biller.findMany({
      where: { billerId: { in: ids } },
      select: { id: true, billerId: true },
    });
  }

  // ============================================================
  // BILLING ITEMS
  // ============================================================

  public async findItemById(id: string) {
    return this.prisma.billingItem.findUnique({
      where: { id },
      include: { category: true, biller: true, provider: true },
    });
  }

  public async findItemsByInternalCode(internalCode: string) {
    return this.prisma.billingItem.findMany({
      where: { internalCode },
      include: { category: true, biller: true, provider: true },
    });
  }

  public async findItemsByProvider(providerId: string, categories?: string[]) {
    return this.prisma.billingItem.findMany({
      where: {
        providerId,
        active: true,
        ...(categories?.length && { categoryId: { in: categories } }),
      },
      include: { biller: true, provider: true, category: true },
      orderBy: {
        amount: 'asc', // or 'desc'
      },
    });
  }

  // ============================================================
  // SYNC UTILITIES
  // ============================================================

  public async bulkUpsertItems(
    providerId: string,
    items: {
      internalCode: string;
      name: string;
      amount?: number | Prisma.Decimal;
      categoryId: string;
      billerId: string;
      paymentCode?: string | null;
    }[],
  ) {
    const results: BillingItem[] = [];
    for (const item of items) {
      const result = await this.prisma.billingItem.upsert({
        where: {
          internalCode_providerId: {
            internalCode: item.internalCode,
            providerId,
          },
        },
        update: {
          name: item.name,
          amount: item.amount ? new Prisma.Decimal(item.amount) : undefined,
          paymentCode: item.paymentCode,
          active: true,
        },
        create: {
          ...item,
          providerId,
        } satisfies Prisma.BillingItemUncheckedCreateInput,
      });
      results.push(result);
    }
    return results;
  }

  async upsertMany<T extends { name: string }>(
    model: keyof PrismaService,
    data: T[],
  ) {
    const repo = (this.prisma as any)[model];

    await Promise.all(
      data.map((item) =>
        repo.upsert({
          where: { name: item.name },
          update: {},
          create: item,
        }),
      ),
    );
  }

  async upsertProviders(providers: any[]) {
    return this.upsertMany('billingProvider', providers);
  }

  async upsertCategories(categories: any[]) {
    return this.upsertMany('billingCategory', categories);
  }
}
