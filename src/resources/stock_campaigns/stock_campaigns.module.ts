import { Module } from '@nestjs/common';
import { StockCampaignsService } from './stock_campaigns.service';
import { StockCampaignsController } from './stock_campaigns.controller';

@Module({
  controllers: [StockCampaignsController],
  providers: [StockCampaignsService],
})
export class StockCampaignsModule {}
