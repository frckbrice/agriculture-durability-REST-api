import { PartialType } from '@nestjs/swagger';
import { CreateStockCampaignDto } from './create-stock_campaign.dto';

export class UpdateStockCampaignDto extends PartialType(
  CreateStockCampaignDto,
) {}
