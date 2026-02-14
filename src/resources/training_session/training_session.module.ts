import { Module } from '@nestjs/common';
import { TrainingSessionService } from './training_session.service';
import { TrainingSessionController } from './training_session.controller';

@Module({
  controllers: [TrainingSessionController],
  providers: [TrainingSessionService],
})
export class TrainingSessionModule {}
