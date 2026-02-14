import { Attendance_sheet } from '@prisma/client';

export class TrainingSession implements Attendance_sheet {
  created_at: Date;
  date: string;
  id: string;
  location: string;
  modules: string[];
  photos: string[];
  report_url: string;
  title: string;
  trainer_proof_of_competency: string[];
  trainer_ignature: string;

  training_id: string;
  trainers: string[];
  updated_at: Date;
  trainer_signature: string[];
}
