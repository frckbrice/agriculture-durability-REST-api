import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { FarmersService } from './farmers.service';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';

@Controller('farmers')
@ApiTags('farmers')
export class FarmersController {
  constructor(
    private readonly farmerService: FarmersService,
  ) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AUDITOR, Role.IT_SUPPORT)
  create(@Body() createfarmerDto: Prisma.FarmerCreateInput) {
    return this.farmerService.create(createfarmerDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AUDITOR, Role.IT_SUPPORT)
  findAll(
    @Query() query: any,
    @CurrentUser() user: Partial<User>,
  ) {
    return this.farmerService.findAll(query, user.company_id as string);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AUDITOR, Role.IT_SUPPORT)
  findOne(@Param('id') id: string) {
    return this.farmerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.IT_SUPPORT)
  update(
    @Param('id') id: string,
    @Body() updatefarmerDto: Prisma.FarmerUpdateInput,
  ) {
    return this.farmerService.update(id, updatefarmerDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.IT_SUPPORT)
  remove(@Param('id') id: string) {
    return this.farmerService.remove(id);
  }
}
