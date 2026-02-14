/* import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RequirementPricePlanService } from './requirement_price-plan.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Prisma, Role } from '@prisma/client';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';

@ApiTags('requirement_price_plan')
@ApiBearerAuth()
@Controller('price_plan_requirements')
export class RequirementPricePlanController {
  constructor(
    private readonly requirementPricePlanService: RequirementPricePlanService,
  ) {}
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.PDG)
  async create(
    @Body() createChapterDto: Prisma.Price_plan_requirementCreateInput,
  ) {
    return this.requirementPricePlanService.create(createChapterDto);
  }

  @ApiResponse({
    status: 200,
    description: 'successfully fetch all requirement price plan',
  })
  async findAllRequirements(@Query() query: { price_plan_id?: string }) {
    return this.requirementPricePlanService.findAllRequirements(query);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChapterDto: Prisma.Price_plan_requirementUpdateInput,
  ) {
    return this.requirementPricePlanService.update(id, updateChapterDto);
  }
}
*/