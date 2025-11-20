import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

console.log('prisma', env('DB_URL'));
export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DB_URL'),
  },
});
