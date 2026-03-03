/**
 * Global Teardown for Jest.
 * Gracefully stops and removes the ephemeral PostgreSQL container.
 */
export default async () => {
  console.log('\n--- TEARING DOWN TEST INFRASTRUCTURE ---');

  const postgresContainer = (global as any).__POSTGRES_CONTAINER__;

  if (postgresContainer) {
    await (postgresContainer as any).stop({ timeout: 10000 });
    console.log('[Testcontainers] PostgreSQL container stopped.');
  }

  const redisContainer = (global as any).__REDIS_CONTAINER__;
  if (redisContainer) {
    await (redisContainer as any).stop({ timeout: 10000 });
    console.log('[Testcontainers] Redis container stopped.');
  }

  console.log('--- TEST INFRASTRUCTURE CLEANUP DONE ---\n');
};
