import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import morgan from 'morgan';
import { ConfigService } from '@nestjs/config';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  // Cors
  app.enableCors({
    origin: ['http://localhost:5173'], // your frontend origin
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
    .setTitle('Bills POC')
    .setDescription('The Bills POC API description')
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
