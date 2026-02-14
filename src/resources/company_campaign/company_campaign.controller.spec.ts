import { Test, TestingModule } from '@nestjs/testing';
import { CompanyCampaignController } from './company_campaign.controller';
import { CompanyCampaignService } from './company_campaign.service';

describe('CompanyCampaignController', () => {
  let controller: CompanyCampaignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyCampaignController],
      providers: [CompanyCampaignService],
    }).compile();

    controller = module.get<CompanyCampaignController>(
      CompanyCampaignController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
