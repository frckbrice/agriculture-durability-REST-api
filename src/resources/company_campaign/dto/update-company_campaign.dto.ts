import { PartialType } from '@nestjs/swagger';
import { CreateCompanyCampaignDto } from './create-company_campaign.dto';

export class UpdateCompanyCampaignDto extends PartialType(
  CreateCompanyCampaignDto,
) {}
