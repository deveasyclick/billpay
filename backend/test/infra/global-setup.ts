import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { execSync } from 'child_process';

/**
 * Global Setup for Jest.
 * Starts a PostgreSQL 15 container and runs migrations.
 * This ensures every test run starts with a clean, up-to-date schema.
 */
export default async () => {
  console.log('\n--- STARTING TEST INFRASTRUCTURE ---');

  // 1. Provision PostgreSQL 15 container dynamically
  const container = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('billpay_test')
    .withUsername('test_admin')
    .withPassword('test_password')
    .start();

  // 2. Build dynamic connection string
  // Note: Testcontainers handles port mapping automatically
  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const dbUrl = `postgresql://test_admin:test_password@${host}:${port}/billpay_test?schema=public`;

  const redisContainer = await new RedisContainer('redis:7-alpine')
    .withExposedPorts(6379) // Expose default Redis port
    .start();

  // 2. Get the connection details (host and port)
  const redisHost = redisContainer.getHost();
  const redisPort = redisContainer.getMappedPort(6379);
  const redisUrl = `redis://${redisHost}:${redisPort}`;

  // 3. Inject into process.env for Prisma and the application
  process.env.DB_URL = dbUrl;
  process.env.REDIS_URL = redisUrl;
  process.env.INTERSWITCH_CLIENT_ID = 'test_client_id';
  process.env.INTERSWITCH_SECRET_KEY = 'test_secret_key';
  process.env.INTERSWITCH_TERMINAL_ID = 'test_terminal_id';
  process.env.INTERSWITCH_API_BASE_URL = 'https://interswitch-test.com';
  process.env.INTERSWITCH_AUTH_URL = 'https://interswitch-auth.com';
  process.env.INTERSWITCH_PAYMENT_BASE_URL = 'https://interswitch-payment.com';
  process.env.INTERSWITCH_MERCHANT_CODE = 'test_merchant_code';

  // Store container references for teardown
  (global as any).__POSTGRES_CONTAINER__ = container;
  (global as any).__REDIS_CONTAINER__ = redisContainer;

  console.log(`[Testcontainers] PostgreSQL started at ${host}:${port}`);
  console.log(`[Prisma] Targeting: ${dbUrl}`);

  console.log('[Prisma] Deploying migrations...');
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DB_URL: dbUrl },
    stdio: 'inherit',
  });

  console.log('--- TEST INFRASTRUCTURE READY ---\n');
};
