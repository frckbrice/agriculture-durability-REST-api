import { Module } from '@nestjs/common';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { CurrentPlanIds } from 'src/global/utils/current-plan-ids';
// import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Module({
  imports: [],
  controllers: [PricesController],
  providers: [
    PricesService,
    CurrentPlanIds,
    // SubscriptionsService,
  ],
})
export class PricesModule { }
