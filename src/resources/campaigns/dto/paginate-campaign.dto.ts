import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class PaginationCampaignQueryDto {
  @ApiProperty()
  perPage?: number = 20; // number of users to query at a time. defaults to 20;

  @ApiProperty()
  page?: number = 0; // number of users to skip;

  status: $Enums.CampaignStatus | undefined;
}
