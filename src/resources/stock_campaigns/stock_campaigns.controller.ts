import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StockCampaignsService } from './stock_campaigns.service';
import { CreateStockCampaignDto } from './dto/create-stock_campaign.dto';
import { UpdateStockCampaignDto } from './dto/update-stock_campaign.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('stock-campaigns')
@Controller('stock-campaigns')
export class StockCampaignsController {
  constructor(private readonly stockCampaignsService: StockCampaignsService) {}

  @Post()
  create(@Body() createStockCampaignDto: CreateStockCampaignDto) {
    return this.stockCampaignsService.create(createStockCampaignDto);
  }

  @Get()
  findAll() {
    return this.stockCampaignsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockCampaignsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStockCampaignDto: UpdateStockCampaignDto,
  ) {
    return this.stockCampaignsService.update(+id, updateStockCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockCampaignsService.remove(+id);
  }
}
