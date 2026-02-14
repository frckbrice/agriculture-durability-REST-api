import { Test, TestingModule } from '@nestjs/testing';
import { StockCampaignsController } from './stock_campaigns.controller';
import { StockCampaignsService } from './stock_campaigns.service';

describe('StockCampaignsController', () => {
  let controller: StockCampaignsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockCampaignsController],
      providers: [StockCampaignsService],
    }).compile();

    controller = module.get<StockCampaignsController>(StockCampaignsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
