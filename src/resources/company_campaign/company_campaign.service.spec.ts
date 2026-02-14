import { Test, TestingModule } from '@nestjs/testing';
import { CompanyCampaignService } from './company_campaign.service';

describe('CompanyCampaignService', () => {
  let service: CompanyCampaignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyCampaignService],
    }).compile();

    service = module.get<CompanyCampaignService>(CompanyCampaignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
