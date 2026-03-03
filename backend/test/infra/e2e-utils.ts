import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from 'src/common/logger/logger.interceptor';

type Override = { provide: any; useValue: any };
/**
 * Shared bootstrap logic for E2E tests.
 * Ensures the test environment mirrors production (main.ts).
 */
export async function createE2EApp(overrides: Override[] = []): Promise<{
  app: INestApplication;
  moduleFixture: TestingModule;
}> {
  let builder = Test.createTestingModule({
    imports: [AppModule],
  });

  // Apply provider overrides **before creating the app**
  for (const o of overrides) {
    builder.overrideProvider(o.provide).useValue(o.useValue);
  }

  const moduleFixture: TestingModule = await builder.compile();

  const app = moduleFixture.createNestApplication();

  // 1. Same Global Prefix as main.ts
  app.setGlobalPrefix('api/v1');

  // 2. Same Global Pipes as main.ts
  app.useGlobalPipes(new ValidationPipe());

  // 3. Same Global Filters and Interceptors
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.init();

  return { app, moduleFixture };
}
