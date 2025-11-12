import { BillCategory, Prisma, PrismaClient, Providers } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Example: seed providers
  const providersData: Prisma.BillingProviderCreateInput[] = [
    { name: Providers.INTERSWITCH, isActive: true },
    { name: Providers.VTPASS, isActive: true },
  ];

  await Promise.all(
    providersData.map(async (p) => {
      return prisma.billingProvider.upsert({
        where: { name: p.name },
        update: {},
        create: p,
      });
    }),
  );

  // Example: seed categories
  const categoriesData: Prisma.BillingCategoryCreateInput[] = [
    { name: BillCategory.AIRTIME, dynamic: false },
    { name: BillCategory.ELECTRICITY, dynamic: false },
    { name: BillCategory.GAMING, dynamic: false },
    { name: BillCategory.DATA, dynamic: true },
    { name: BillCategory.TV, dynamic: true },
  ];

  for (const category of categoriesData) {
    await prisma.billingCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
