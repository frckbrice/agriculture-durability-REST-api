import { Module } from '@nestjs/common';
import { CompanyCampaignService } from './company_campaign.service';
import { CompanyCampaignController } from './company_campaign.controller';

@Module({
  controllers: [CompanyCampaignController],
  providers: [CompanyCampaignService],
})
export class CompanyCampaignModule {}
