import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompanyCampaignService } from './company_campaign.service';
import { CreateCompanyCampaignDto } from './dto/create-company_campaign.dto';
import { UpdateCompanyCampaignDto } from './dto/update-company_campaign.dto';
import { Prisma } from '@prisma/client';

@Controller('company-campaign')
export class CompanyCampaignController {
  constructor(
    private readonly companyCampaignService: CompanyCampaignService,
  ) {}

  @Post()
  create(@Body() createCompanyCampaignDto: Prisma.Company_CampaignCreateInput) {
    return this.companyCampaignService.create(createCompanyCampaignDto);
  }

  @Get()
  findAll() {
    return this.companyCampaignService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyCampaignService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyCampaignDto: UpdateCompanyCampaignDto,
  ) {
    return this.companyCampaignService.update(id, updateCompanyCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyCampaignService.remove(id);
  }
}
