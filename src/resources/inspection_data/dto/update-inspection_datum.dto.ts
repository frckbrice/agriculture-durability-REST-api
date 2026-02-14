import { PartialType } from '@nestjs/swagger';
import { CreateInspectionDatumDto } from './create-inspection_datum.dto';

export class UpdateInspectionDatumDto extends PartialType(
  CreateInspectionDatumDto,
) {}
