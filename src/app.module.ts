import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestService } from './global/current-logged-in/request.service';
import { AuthMiddleware } from './global/auth/middleware/auth.middleware';
import { RolesGuard } from './global/auth/guards/auth.guard';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CompaniesModule } from './resources/companies/companies.module';
import { ProjectsModule } from './resources/projects/projects.module';
import { InspectionDataModule } from './resources/inspection_data/inspection_data.module';
import { MappingsModule } from './resources/mappings/mappings.module';
import { CampaignsModule } from './resources/campaigns/campaigns.module';
import { StockCampaignsModule } from './resources/stock_campaigns/stock_campaigns.module';
import { MarketsModule } from './resources/markets/markets.module';
import { ReceiptsModule } from './resources/receipts/receipts.module';
import { TransactionsModule } from './resources/transactions/transactions.module';
import { SubscriptionsModule } from './resources/subscriptions/subscriptions.module';
import { PricesModule } from './resources/prices/prices.module';
import { ShareModule } from './global/share/share.module';
import { FarmersModule } from './resources/farmers/farmers.module';
import { FarmsModule } from './resources/farms/farms.module';
import { MyLoggerModule } from './global/logger/logger.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './adapters/config/prisma.module';
import { AuthModule } from './global/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TrainingsModule } from './resources/trainings/trainings.module';
import { HealthModule } from './resources/health/health.module';
import { TrainingSessionModule } from './resources/training_session/training_session.module';
import { MailModule } from './global/share/mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CompanyCampaignModule } from './resources/company_campaign/company_campaign.module';
import { ProjectAssigneeModule } from './resources/project-assignee/project-assignee.module';
import { AgricultureModule } from './resources/agriculture/agriculture.module';
import { EnvironmentModule } from './resources/environment/environment.module';
import { SocialModule } from './resources/social/social.module';
import { RevenuEtResponsabilitePartagerModule } from './resources/revenu-et-responsabilite-partager/revenu-et-responsabilite-partager.module';
import { SubscriptionManagementService } from './resources/subscriptions/subscribe.deactivation';


@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5, //TODO: reduce this and apply correct handling response
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 5, // seconds
      // max: 10, // maximum number of items in cache
      isGlobal: true,
    }),
    CompaniesModule,
    ProjectsModule,
    InspectionDataModule,
    MappingsModule,
    CampaignsModule,
    StockCampaignsModule,
    MarketsModule,
    ReceiptsModule,
    TransactionsModule,
    SubscriptionsModule,
    PricesModule,
    PrismaModule,
    FarmersModule,
    FarmsModule,
    MyLoggerModule,
    AuthModule,
    ShareModule,
    TrainingsModule,
    HealthModule,
    TrainingSessionModule,
    MailModule,
    CompanyCampaignModule,
    ProjectAssigneeModule,
    AgricultureModule,
    EnvironmentModule,
    SocialModule,
    RevenuEtResponsabilitePartagerModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RequestService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor, // caching
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    SubscriptionManagementService
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(AuthMiddleware).forRoutes({ path: "/", method: RequestMethod.GET });
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
