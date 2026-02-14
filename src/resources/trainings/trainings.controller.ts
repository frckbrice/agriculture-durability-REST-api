import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TrainingService } from './trainings.service';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma, Role, User } from '@prisma/client';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';
import { PaginationTrainingQueryDto } from './dto/paginate-training.dto';
import { TrainingEntity } from './entities/training.entity';

// @UseGuards(RolesGuard)
@ApiTags('trainings')
@Controller('trainings')
@ApiBearerAuth()
@SkipThrottle() // TODO: set this throttler later to correct value
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) { }

  @Post()
  @ApiOperation({ summary: 'create training model object' })
  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  create(
    @Body() createTrainingDatumDto: Prisma.TrainingCreateInput,
    @CurrentUser() user: Partial<User>,
  ) {
    return this.trainingService.create(createTrainingDatumDto, user);
  }

  @Roles(Role.ADG, Role.AUDITOR)
  @UseGuards(RolesGuard)
  @Get()
  @ApiOperation({ summary: 'find all trainings' })
  @ApiResponse({
    status: 200,
    description: 'The trainings has been successfully fetched.',
  })
  findAll(
    @Query() query: PaginationTrainingQueryDto | { agentCode: string },
    @CurrentUser() user: Partial<User>) {
    console.log("hit tranings controler: ", query)
    return this.trainingService.findAll(query, <string>user.company_id);
  }

  @Roles(Role.ADG, Role.AUDITOR)
  @UseGuards(RolesGuard)
  @Get(':training_id')
  @ApiOperation({ summary: 'find one training with its id' })
  @ApiResponse({
    status: 200,
    description: 'The training has been successfully fetched.',
  })
  findOne(@Param('training_id') training_id: string) {
    return this.trainingService.findOne(training_id);
  }



  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Patch(':training_id')
  @ApiOperation({ summary: 'update one training with its training_id' })
  update(
    @Param('training_id') training_id: string,
    @Body() updateTrainingDatumDto: Prisma.TrainingUpdateInput,
  ) {
    return this.trainingService.update(training_id, updateTrainingDatumDto);
  }


  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Delete(':training_id')
  @ApiOperation({ summary: 'delete one training with its training_id' })
  remove(@Param('training_id') training_id: string) {
    return this.trainingService.remove(training_id);
  }


  // PHONE REQUESTS: This needs to be customised. there is redundency and not follow best practice for design patterns

  // get training project by its code added by agent
  @Roles(Role.ADG, Role.AUDITOR)
  @UseGuards(RolesGuard)
  @Get(':training_code/phone')
  @ApiOperation({ summary: 'find one training with its code from mobile' })
  @ApiResponse({
    status: 200,
    description: 'The training has been successfully fetched.',
  })
  getOneTrainingByItsCodeFromPhone(@Param('training_code') training_code: string) {

    console.log("from training controller: ", training_code)
    return this.trainingService.findTrainingProjectByItsCode(training_code);
  }

  // get all trainings

}
