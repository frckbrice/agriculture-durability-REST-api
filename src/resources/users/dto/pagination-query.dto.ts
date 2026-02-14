import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class PaginationQueryDto {
  @ApiProperty()
  perPage?: number = 40; // number of users to query at a time. defaults to 40;

  @ApiProperty()
  page?: number = 0; // number of users to skip;

  @ApiProperty()
  role?: Role = Role.ADG;
}
