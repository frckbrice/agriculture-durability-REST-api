import { PartialType } from '@nestjs/swagger';
import { CreateRequirementPricePlanDto } from './create-requirement_price-plan.dto';

export class UpdateRequirementPricePlanDto extends PartialType(
  CreateRequirementPricePlanDto,
) {}
