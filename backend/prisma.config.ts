import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot();
export default {
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
};
