import { Test, TestingModule } from '@nestjs/testing';
import { RequirementPricePlanController } from './requirement_price-plan.controller';
import { RequirementPricePlanService } from './requirement_price-plan.service';

describe('RequirementPricePlanController', () => {
  let controller: RequirementPricePlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequirementPricePlanController],
      providers: [RequirementPricePlanService],
    }).compile();

    controller = module.get<RequirementPricePlanController>(
      RequirementPricePlanController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
