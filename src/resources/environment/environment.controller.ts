
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { Prisma, Role, User } from '@prisma/client';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';

@Controller('environments')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.IT_SUPPORT)
  create(@Body() createEnvironmentDto: Prisma.EnvironmentCreateInput) {
    return this.environmentService.create(createEnvironmentDto)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AUDITOR, Role.IT_SUPPORT)
  findAll(@Query() query: { activity_title: string }, @CurrentUser() user: Partial<User>) {
    return this.environmentService.getAll(query, <string>user.company_id)
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AUDITOR, Role.IT_SUPPORT)
  findOne(@Param('id') id: string) {
    return this.environmentService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.IT_SUPPORT)
  update(@Param('id') id: string, @Body() updateEnvironmentDto: Prisma.EnvironmentUpdateInput) {
    return this.environmentService.update(id, updateEnvironmentDto)
  }

  @Delete(':id')
  @UseGuards()
  @Roles(Role.ADG, Role.IT_SUPPORT)
  delete(@Param('id') id: string) {
    return this.environmentService.delete(id)
  }
}
