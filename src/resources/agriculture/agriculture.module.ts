import { Module } from '@nestjs/common';
import { AgricultureController } from './agriculture.controller';
import { AgricultureService } from './agriculture.service';

@Module({
  controllers: [AgricultureController],
  providers: [AgricultureService]
})
export class AgricultureModule {}
