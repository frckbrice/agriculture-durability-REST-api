import { Module } from '@nestjs/common';
import { MappingsService } from './mappings.service';
import { MappingsController } from './mappings.controller';

@Module({
  controllers: [MappingsController],
  providers: [MappingsService],
})
export class MappingsModule {}
