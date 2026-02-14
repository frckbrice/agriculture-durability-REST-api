import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma, Role, User } from '@prisma/client';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { AgricultureService } from './agriculture.service';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';

@Controller('agricultures')
@ApiTags('environment')
export class AgricultureController {
  constructor(private readonly agricultureService: AgricultureService) { }

  @Post()
  @Roles(Role.ADG, Role.IT_SUPPORT)
  @UseGuards(RolesGuard)
  create(@Body() createAgricultureDto: Prisma.AgricultureCreateInput) {
    return this.agricultureService.create(createAgricultureDto)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.IT_SUPPORT, Role.AUDITOR)
  findAll(@Query() query: { activity: string }, @CurrentUser() user: Partial<User>) {
    return this.agricultureService.findAll(query, <string>user.company_id)
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AUDITOR, Role.IT_SUPPORT)
  findOne(@Param('id') id: string) {
    console.log('id from controller', id)
    return this.agricultureService.findOne(id)
  }

  @Patch(':id')
  @Roles(Role.ADG, Role.IT_SUPPORT)
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateAgricultureDto: Prisma.AgricultureUpdateInput) {
    return this.agricultureService.update(id, updateAgricultureDto)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.IT_SUPPORT)
  delete(@Param('id') id: string) {
    return this.agricultureService.delete(id)
  }

}
