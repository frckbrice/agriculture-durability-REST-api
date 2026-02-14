import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PaymentSubscriptionService } from './subscribe.service.dao';
// import { HttpModule } from "@nestjs/axios";
import { FetchModule } from 'nestjs-fetch';
import { CurrentPlanIds } from 'src/global/utils/current-plan-ids';
import { PricesModule } from '../prices/prices.module';
import { ApplyNixins } from 'src/global/utils/create-object-type';
import { SubscriptionManagementService } from './subscribe.deactivation';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    FetchModule.register({
      baseUrl: 'https://api-m.sandbox.paypal.com',
    }),
    PricesModule,
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    PaymentSubscriptionService,
    CurrentPlanIds,
    ApplyNixins,
    SubscriptionManagementService,
  ],
  exports: [SubscriptionsService, SubscriptionManagementService],
})
export class SubscriptionsModule { }
