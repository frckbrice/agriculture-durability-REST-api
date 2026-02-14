import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RevenuEtResponsabilitePartagerService } from './revenu-et-responsabilite-partager.service';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { Prisma, Role, User } from '@prisma/client';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';

@Controller('revenu-et-responsabilite-partager')
export class RevenuEtResponsabilitePartagerController {
  constructor(private readonly revenuService: RevenuEtResponsabilitePartagerService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.IT_SUPPORT)
  create(@Body() createRevenuDto: Prisma.RevenuEtResponsabilitePartagerCreateInput ) {
    return this.revenuService.create(createRevenuDto)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AUDITOR, Role.IT_SUPPORT)
  findAll(@Query() query: { activity_title: string }, @CurrentUser() user: Partial<User>) {
    return this.revenuService.findAll(query, <string>user.company_id)
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AUDITOR, Role.IT_SUPPORT)
  findOne(@Param('id') id: string) {
    return this.revenuService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.IT_SUPPORT)
  update(@Body() updateRevenu: Prisma.RevenuEtResponsabilitePartagerCreateInput, @Param('id') id: string) {
    return this.revenuService.update(id, updateRevenu)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG,
    Role.IT_SUPPORT
  )
  delete(@Param() id: string) {
    this.revenuService.delete(id)
  }
}
