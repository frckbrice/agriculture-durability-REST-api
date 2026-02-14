import { PartialType } from '@nestjs/swagger';
import { CreateTrainingSessionDto } from './create-training_session.dto';

export class UpdateTrainingSessionDto extends PartialType(
  CreateTrainingSessionDto,
) {}
