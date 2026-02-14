import { Test, TestingModule } from '@nestjs/testing';
import { InspectionDataController } from './inspection_data.controller';
import { InspectionDataService } from './inspection_data.service';

describe('InspectionDataController', () => {
  let controller: InspectionDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionDataController],
      providers: [InspectionDataService],
    }).compile();

    controller = module.get<InspectionDataController>(InspectionDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
