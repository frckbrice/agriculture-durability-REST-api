import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus, TypeProject } from '@prisma/client';

export class PaginationCompanyQueryDto {
  @ApiProperty()
  perPage?: number = 20; // number of users to query at a time. defaults to 40;

  @ApiProperty()
  page?: number = 0; // number of users to skip;
}
