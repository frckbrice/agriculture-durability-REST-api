import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Slugify } from 'src/global/utils/slugilfy';
// import { ProjectInvitationService } from './projects.invitation';
import { ProjectAssigneeModule } from '../project-assignee/project-assignee.module';
import { MarketsModule } from '../markets/markets.module';
import { TrainingsModule } from '../trainings/trainings.module';
import { MarketsService } from '../markets/markets.service';
import { TrainingService } from '../trainings/trainings.service';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ProjectAssigneeModule,
    MarketsModule,
    ProjectsModule,
    TrainingsModule,
    CampaignsModule,
    UsersModule
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    MarketsService,
    TrainingService,
    Slugify,
    // ProjectInvitationService
  ],
})
export class ProjectsModule { }
