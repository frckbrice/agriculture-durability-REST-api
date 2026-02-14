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
import { InspectionDataService } from './inspection_data.service';
import { CreateInspectionDatumDto } from './dto/create-inspection_datum.dto';
import { UpdateInspectionDatumDto } from './dto/update-inspection_datum.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Prisma, Role, User } from '@prisma/client';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';

@ApiTags('inspection_data')
@Controller('inspection_data')
export class InspectionDataController {
  constructor(private readonly inspectionDataService: InspectionDataService) { }

  @Post()
  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'create project data' })
  create(
    @Body() createInspectionDatumDto: Prisma.Inspection_dataCreateInput & { council?: string },
    @Query() query: { type: string },
    @CurrentUser() user: Partial<User>,
  ) {
    return this.inspectionDataService.create(createInspectionDatumDto, query.type, <string>user?.company_id);
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Get()
  @ApiOperation({ summary: 'find all inspection data' })
  findAll(
    @Query() query: { project_id: string; page?: number; perPage?: number },
  ) {
    return this.inspectionDataService.findAll(query);
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'find one inspection data whit its id' })
  findOne(@Param('id') id: string) {
    return this.inspectionDataService.findOne(id);
  }

  @Get(':id/current')
  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'find inspection data by project_id' })
  getAll(@Param('id') id: string) {
    return this.inspectionDataService.getAll(id)
  }


  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'update one inspection data whit its id' })
  update(
    @Param('id') id: string,
    @Body() updateInspectionDatumDto: Prisma.Inspection_dataUpdateInput,
  ) {
    return this.inspectionDataService.update(id, updateInspectionDatumDto);
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'delete one inspection data whit its id' })
  remove(@Param('id') id: string) {
    return this.inspectionDataService.remove(id);
  }
}
