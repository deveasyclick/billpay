import { PrismaService } from 'src/prisma.service';

const prisma = new PrismaService();
async function main() {
  console.log('iniside seed');
  await prisma.provider.create({
    data: {
      name: 'interswitch',
      active: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
