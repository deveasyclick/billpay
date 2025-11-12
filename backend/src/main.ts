import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import morgan from 'morgan';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { createWinstonLoggerOptions } from './common/logger/winston-logger';

import { LoggingInterceptor } from './common/logger/logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonLoggerOptions()),
  });

  // Apply the logging interceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );
  // Cors
  app.enableCors({
    origin: ['http://localhost:3000'], // your frontend origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // methods you need
    allowedHeaders: ['Content-Type', 'Authorization'], // headers your frontend sends
    credentials: true, //
  });

  // http request logger
  app.use(morgan('combined'));

  // global route prefix
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Billpay')
    .setDescription('The Billpay API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  // env variable
  const configService = app.get(ConfigService);
  const logger = new Logger();
  await app.listen(configService.get<number>('PORT', 4000));

  app.useGlobalPipes(new ValidationPipe());

  logger.log(`Server started on port ${configService.get<number>('PORT')}`);
}
bootstrap();
