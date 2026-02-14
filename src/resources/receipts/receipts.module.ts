import { Module } from '@nestjs/common';
import { ReceiptService } from './receipts.service';
import { ReceiptController } from './receipts.controller';
import { FarmersModule } from '../farmers/farmers.module';
import { FarmersService } from '../farmers/farmers.service';
import { ReceiptWorker } from './worker-receipts';

@Module({
  imports: [FarmersModule],
  controllers: [ReceiptController],
  providers: [
    ReceiptService,
    FarmersService,
    ReceiptWorker
  ],
  exports: [ReceiptService],
})
export class ReceiptsModule { }
