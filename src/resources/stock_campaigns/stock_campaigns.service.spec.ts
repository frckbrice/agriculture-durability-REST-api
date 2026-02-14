import { Test, TestingModule } from '@nestjs/testing';
import { StockCampaignsService } from './stock_campaigns.service';

describe('StockCampaignsService', () => {
  let service: StockCampaignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockCampaignsService],
    }).compile();

    service = module.get<StockCampaignsService>(StockCampaignsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
