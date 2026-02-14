import { Module } from '@nestjs/common';
import { TrainingService } from './trainings.service';
import { TrainingController } from './trainings.controller';
import { UsersModule } from '../users/users.module';
import { Slugify } from 'src/global/utils/slugilfy';
import { ProjectAssigneeModule } from '../project-assignee/project-assignee.module';

@Module({
  imports: [UsersModule, ProjectAssigneeModule],
  controllers: [TrainingController],
  providers: [
    TrainingService,
    Slugify,
  ],
})
export class TrainingsModule { }
