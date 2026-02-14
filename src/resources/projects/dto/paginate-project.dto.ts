import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Project, ProjectStatus, TypeProject } from '@prisma/client';

export class PaginationProjectQueryDto {
  @ApiProperty()
  perPage?: number = 20; // number of users to query at a time. defaults to 40;

  @ApiProperty()
  page?: number = 0; // number of users to skip;

  @ApiProperty()
  status: ProjectStatus = 'DRAFT';

  @ApiProperty()
  type: TypeProject = 'INITIAL_INSPECTION';

  @ApiProperty()
  search?: string;

  campaign_id?: string;

}
