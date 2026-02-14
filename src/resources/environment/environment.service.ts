import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { PaginationEnvironmentQueryDto } from './dto/paginate-environment.dto';

@Injectable()
export class EnvironmentService {
  private readonly logger = new LoggerService(EnvironmentService.name)

  constructor(
    private readonly prismaService: PrismaService
  ) { }

  // CREATE NEW ENVIRONMENT DATA
  async create(createEnvironmentDto: Prisma.EnvironmentCreateInput) {
    try {
      const creationResult = await this.prismaService.environment.create({
        data: createEnvironmentDto
      })
      if (creationResult) {
        return {
          message: "Successfully saved environment data",
          status: 201,
          data: creationResult
        }
      }
      return {
        message: "Could not save environment data",
        status: 400,
        data: null
      }

    } catch (error) {
      console.log(error)
      this.logger.error(`Failed to create environment\n ${error}`, EnvironmentService.name)
      throw new HttpException('Failed to create environment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET ALL ENVIRONMENTS
  async getAll(query: Partial<PaginationEnvironmentQueryDto> | any, company_id: string) {
    const { page, perPage, activity_title } = query

    let where = Object.create({})
    let Query = Object.create(where)
    if (activity_title) where["activity_title"] = activity_title

    Query = {
      ...Query,
      take: perPage ?? 20,
      skip: (page ?? 0) * (perPage ?? 20 - 1),
      orderBy: {
        create_at: 'desc'
      }
    }

    try {
      const [total, environment] = await this.prismaService.$transaction([
        this.prismaService.environment.count(),
        this.prismaService.environment.findMany({
          where: {
            ...where, company_id
          }
        })
      ])
      if (environment.length) {
        return {
          status: 200,
          message: "Successfully fetched environment",
          data: environment
        }
      }
      return {
        status: HttpStatus.NOT_FOUND,
        message: "No environments data found for this company",
        data: null
      }

    } catch (error) {
      this.logger.error(`Failed to fetch all environment data \n ${error}`, EnvironmentService.name);
      throw new HttpException('Failed to find all environment data', HttpStatus.NOT_FOUND)

    }
  }

  // FIND ONE BY ID
  async findOne(id: string) {
    try {
      const singleEnvironmentData = await this.prismaService.environment.findUnique({
        where: {
          id
        }
      })
      if (singleEnvironmentData) {
        return {
          status: 200,
          message: "Successfully fetch single environment record",
          data: singleEnvironmentData
        }
      } else return {
        status: HttpStatus.NOT_FOUND,
        message: "Record not found",
        data: null
      }
    } catch (error) {
      this.logger.error(`Failed to fetch all environment data \n ${error}`, EnvironmentService.name);
      throw new HttpException('Failed to find single environment data', HttpStatus.NOT_FOUND)
    }
  }

  // UPDATE ENVIRONMENT DATA
  async update(id: string, updateEnvironmentDto: Prisma.EnvironmentUpdateInput) {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const res = await this.prismaService.environment.update({
          data: updateEnvironmentDto,
          where: {
            id
          }
        })
        return res
      })

      // const result = await this.prismaService.environment.update({
      //   data: updateEnvironmentDto,
      //   where: {
      //     id
      //   }
      // })
      if (result) {
        return {
          status: 204,
          message: "Environment updtated successfully",
          data: result
        }
      } else return {
        status: 400,
        message: "Failed to update record",
        data: null
      }

    } catch (error) {
      console.log(error)
      this.logger.error(`Can't update environment record of id ${id} \n ${error}`,
        EnvironmentService.name)
    }
    throw new InternalServerErrorException("Can't update record")
  }

  // DELETE ENVIRONMENT
  async delete(id: string) {
    try {

      // CHECK IF REORD EXIST
      const existingEnvironment = await this.prismaService.environment.findUnique({
        where: { id }
      })
      if (typeof existingEnvironment == "undefined") return {
        data: null,
        message: "No environment record with such id",
        status: HttpStatus.BAD_REQUEST
      }
      const result = await this.prismaService.environment.delete({
        where: {
          id
        }
      })

      if (result) {
        return {
          data: result,
          status: HttpStatus.NO_CONTENT,
          message: "Environment record deleted successfully"
        }
      } else {
        return {
          status: HttpStatus.BAD_REQUEST,
          messgage: "Failed to delete environment record",
          data: null
        }
      }

    } catch (error) {
      this.logger.error(`Can't delete environment record of id ${id} \n\n ${error}`, EnvironmentService.name)
      throw new InternalServerErrorException("Can't delete data environment")

    }
  }


}

