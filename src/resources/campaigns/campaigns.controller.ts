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
import { CampaignService } from './campaigns.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma, Role } from '@prisma/client';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';
import { PaginationCampaignQueryDto } from './dto/paginate-campaign.dto';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignService) { }
  private readonly logger = new LoggerService(CampaignsController.name);
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADG)
  create(
    @Body() createCampaignDto: Prisma.CampaignCreateInput,
    @CurrentUser() user: any,
  ) {
    return this.campaignsService.create(createCampaignDto, user);
  }

  @Get()
  @Roles(Role.ADG)
  findAll(@Query() query: Partial<PaginationCampaignQueryDto>) {
    return this.campaignsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Get('current')
  findCurrentCampaign() {
    return this.campaignsService.getCurrentCampaign();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: Prisma.CampaignUpdateInput,
  ) {
    return this.campaignsService.update(id, updateCampaignDto);
  }


}
