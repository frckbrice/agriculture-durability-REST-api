import { Test, TestingModule } from '@nestjs/testing';
import { InspectionDataService } from './inspection_data.service';

describe('InspectionDataService', () => {
  let service: InspectionDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InspectionDataService],
    }).compile();

    service = module.get<InspectionDataService>(InspectionDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
