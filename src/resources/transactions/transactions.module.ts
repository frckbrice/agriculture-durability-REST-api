import { Module } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { TransactionController } from './transactions.controller';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionsModule { }
