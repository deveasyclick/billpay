import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { validateConfig } from './config/config.validation';
import configuration from './config/configuration';
import { BillsModule } from './modules/bills/bills.module';
import { QueueModule } from './modules/queue/queue.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    PrismaModule,
    QueueModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateConfig,
    }),
    BillsModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [AppService, AppResolver],
})
export class AppModule {}
