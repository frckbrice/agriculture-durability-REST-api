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
import { TrainingSessionService } from './training_session.service';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma, Role } from '@prisma/client';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { PaginationTrainingSessionQueryDto } from './dto/paginate-training_session.dto';

// @UseGuards(RolesGuard)
@ApiTags('training_sessions')
@Controller('training_sessions')
@ApiBearerAuth()
@SkipThrottle() // TODO: set this throttler later to correct value
export class TrainingSessionController {
  constructor(
    private readonly training_sessionservice: TrainingSessionService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'create training session model object' })
  @ApiResponse({ status: 201, description: 'Success' })
  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  create(@Body() createSessionDatumDto: Prisma.Attendance_sheetCreateInput) {
    return this.training_sessionservice.create(createSessionDatumDto);
  }

  @Roles(Role.ADG, Role.AUDITOR)
  @UseGuards(RolesGuard)
  @Get()
  @ApiOperation({ summary: 'find all training_sessions' })
  @ApiResponse({
    status: 200,
    description: 'The training_sessions has been successfully fetched.',
  })
  findAll(@Query() query: PaginationTrainingSessionQueryDto) {
    return this.training_sessionservice.findAll(query);
  }

  @Roles(Role.ADG, Role.AUDITOR)
  @UseGuards(RolesGuard)
  @Get(':session_id')
  @ApiOperation({ summary: 'find one session with its id' })
  @ApiResponse({
    status: 200,
    description: 'The session has been successfully fetched.',
  })
  findOne(@Param('session_id') session_id: string) {
    return this.training_sessionservice.findOne(session_id);
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Patch(':session_id')
  @ApiOperation({ summary: 'update one training with its session_id' })
  update(
    @Param('session_id') session_id: string,
    @Body() updateSessionDatumDto: Prisma.Attendance_sheetUpdateInput,
  ) {
    return this.training_sessionservice.update(
      session_id,
      updateSessionDatumDto,
    );
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Delete(':session_id')
  @ApiOperation({ summary: 'delete one training with its session_id' })
  remove(@Param('session_id') session_id: string) {
    return this.training_sessionservice.remove(session_id);
  }
}
