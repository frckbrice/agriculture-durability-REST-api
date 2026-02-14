import { Injectable } from '@nestjs/common';
import { CreateStockCampaignDto } from './dto/create-stock_campaign.dto';
import { UpdateStockCampaignDto } from './dto/update-stock_campaign.dto';

@Injectable()
export class StockCampaignsService {
  create(createStockCampaignDto: CreateStockCampaignDto) {
    return 'This action adds a new stockCampaign';
  }

  findAll() {
    return `This action returns all stockCampaigns`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stockCampaign`;
  }

  update(id: number, updateStockCampaignDto: UpdateStockCampaignDto) {
    return `This action updates a #${id} stockCampaign`;
  }

  remove(id: number) {
    return `This action removes a #${id} stockCampaign`;
  }
}
