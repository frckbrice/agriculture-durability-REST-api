import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CompanyService } from './companies.service';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Prisma, Role, User } from '@prisma/client';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { PaginationCompanyQueryDto } from './dto/paginate-company.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';

// @UseGuards(RolesGuard)
@ApiTags('companies')
@Controller('companies')
@SkipThrottle()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Post()
  @ApiOperation({ summary: 'create project data' })
  @UseGuards(RolesGuard)
  create(
    @Body() createInspectionDatumDto: Prisma.CompanyCreateInput,
    @CurrentUser() user: Partial<User>,
  ) {
    return this.companyService.create(createInspectionDatumDto, user);
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Get()
  @ApiOperation({ summary: 'find all companies' })
  findAll(@Query() query: PaginationCompanyQueryDto) {
    return this.companyService.findAll(query);
  }

  // get the current company
  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Get('current')
  @ApiOperation({ summary: 'find the currently company of the connected user' })
  findOne(@CurrentUser() user: Partial<User>) {

    console.log("user\n", user)
    const id = <string>user?.company_id;
    return this.companyService.findOne(id);
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'find the currently company of the connected user' })
  findCurrentCompanyById(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'update one company with its id' })
  update(
    @Param('id') id: string,
    @Body() updateInspectionDatumDto: Prisma.CompanyUpdateInput,
  ) {
    return this.companyService.update(id, updateInspectionDatumDto);
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'delete one company with its id' })
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}
