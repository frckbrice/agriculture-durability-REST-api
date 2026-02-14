import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { Prisma, User } from '@prisma/client';
import { LoggerService } from 'src/global/logger/logger.service';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { UsersService } from '../users/users.service';
// import { Slugify } from 'src/global/utils/slugilfy';
import { PaginationTrainingSessionQueryDto } from './dto/paginate-training_session.dto';

@Injectable()
export class TrainingSessionService {
  private readonly logger = new LoggerService(TrainingSessionService.name);

  constructor(private readonly prismaService: PrismaService) { }

  async create(createTrainingSessionDto: Prisma.Attendance_sheetCreateInput) {
    try {
      const result = await this.prismaService.attendance_sheet.create({
        data: {
          ...createTrainingSessionDto,
        },
      });

      if (result)
        return {
          data: result,
          status: 201,
          message: `attendance_sheet created successfully`,
        };
      else
        return {
          data: null,
          status: 500,
          message: `Failed to create attendance_sheet`,
        };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error(
          `Error while  creating attendance_sheet ${error.name}: Validation error \n\n ${error}`,
          TrainingSessionService.name,
        );
        throw new InternalServerErrorException(
          `Validation Error while creating attendance_sheet ` +
          createTrainingSessionDto.id,
        );
      }
      this.logger.error(
        `Error while creating attendance_sheet ${createTrainingSessionDto.id} \n\n ${error}`,
        TrainingSessionService.name,
      );
      throw new InternalServerErrorException(
        `Error while creating attendance_sheet ` + TrainingSessionService.name,
      );
    }
  }

  async findAll(query: Partial<PaginationTrainingSessionQueryDto>) {
    // find all the training with the latest start date with its status and type
    const { page, perPage } = query;
    let Query = Object.create({});
    Query = {
      ...Query,

      take: perPage ?? 20,
      skip: (page ?? 0) * (perPage ?? 20 - 1),
      orderBy: {
        created_at: 'desc',
      },
    };
    // find all the companies
    try {
      const [total, attendance_sheets] = await this.prismaService.$transaction([
        this.prismaService.attendance_sheet.count(),
        this.prismaService.attendance_sheet.findMany(Query),
      ]);
      if (attendance_sheets.length)
        return {
          status: 200,
          message: 'attendance_sheets fetched successfully',
          data: attendance_sheets,
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20 - 1,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
      else
        return {
          status: 400,
          message: 'No attendance_sheets found',
          data: [],
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
    } catch (error) {
      this.logger.error(
        `Error fetching attendance_sheets \n\n ${error}`,
        TrainingSessionService.name,
      );
      throw new NotFoundException('Error fetching attendance_sheets');
    }
  }

  async findOne(session_id: string) {
    try {
      const result = await this.prismaService.attendance_sheet.findUnique({
        where: {
          id: session_id,
        },
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `training fetched successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to fetch training`,
        };
    } catch (err) {
      this.logger.error(
        `Can't find a training with title: ${session_id} \n\n ${err}`,
        TrainingSessionService.name,
      );
      throw new NotFoundException(
        "Can't find a training with id " + session_id,
      );
    }
  }

  async update(
    session_id: string,
    updateTrainingDto: Prisma.Attendance_sheetUpdateInput,
  ) {
    try {
      const result = await this.prismaService.attendance_sheet.update({
        data: updateTrainingDto,
        where: {
          id: session_id,
        },
      });

      if (result)
        return {
          data: result,
          status: 204,
          message: `attendance_sheet updated successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to update attendance_sheet`,
        };
    } catch (err) {
      this.logger.error(
        `Can't update a attendance_sheet  with id ${session_id} \n\n ${err} `,
        TrainingSessionService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a attendance_sheet with session_id " + session_id,
      );
    }
  }

  async remove(session_id: string) {
    try {
      const result = await this.prismaService.attendance_sheet.delete({
        where: {
          id: session_id,
        },
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `attendance_sheet deleted successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to delete attendance_sheet`,
        };
    } catch (err) {
      this.logger.error(
        `Can't delete a attendance_sheet with session_id ${session_id} \n\n ${err}`,
        TrainingSessionService.name,
      );
      throw new InternalServerErrorException(
        "Can't delete a attendance_sheet with session_id " + session_id,
      );
    }
  }
}
