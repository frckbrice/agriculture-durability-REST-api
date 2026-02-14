import { Module } from '@nestjs/common';
import { InspectionDataService } from './inspection_data.service';
import { InspectionDataController } from './inspection_data.controller';
import { FieldWorkerHost } from './worker-host';
import { FarmWorkerHost } from './worker-host-farm';
import { AttendanceSheetWorker } from './worker-host-training';

@Module({
  controllers: [InspectionDataController],
  providers: [
    InspectionDataService,
    FieldWorkerHost,
    FarmWorkerHost,
    AttendanceSheetWorker
  ],
})
export class InspectionDataModule { }
