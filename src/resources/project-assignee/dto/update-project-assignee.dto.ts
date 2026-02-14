import { PartialType } from '@nestjs/swagger';
import { CreateProjectAssigneeDto } from './create-project-assignee.dto';

export class UpdateProjectAssigneeDto extends PartialType(CreateProjectAssigneeDto) {}
