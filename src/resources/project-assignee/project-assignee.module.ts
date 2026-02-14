import { Module } from '@nestjs/common';
import { ProjectAssigneeService } from './project-assignee.service';
import { ProjectAssigneeController } from './project-assignee.controller';
import { AssigneeWorker } from './worker-assignee';

@Module({
  imports: [
  ],
  controllers: [ProjectAssigneeController],
  providers: [
    ProjectAssigneeService,
    AssigneeWorker
  ],
  exports: [
    ProjectAssigneeService,
  ]
})
export class ProjectAssigneeModule { }
