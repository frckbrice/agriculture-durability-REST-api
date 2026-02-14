import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { ProjectAssigneeModule } from '../project-assignee/project-assignee.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [
    ProjectAssigneeModule,
    CampaignsModule,
  ],
  controllers: [MarketsController],
  providers: [MarketsService],
})
export class MarketsModule { }
