import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatus, MarketType } from '@prisma/client';

export class PaginationMarketQueryDto {
  @ApiProperty()
  perPage?: number = 20; // number of users to query at a time. defaults to 40;

  @ApiProperty()
  page?: number = 0; // number of users to skip;

  @ApiProperty()
  status: CampaignStatus = 'CLOSED';

  @ApiProperty()
  type: MarketType = 'COCOA';

  @ApiProperty()
  search?: string;

  campaign_id?: string;

  agentCode?: string;

  village: string;
}
