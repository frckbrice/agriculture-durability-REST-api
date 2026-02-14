import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { PaginationAgricultureDto } from './dto/pagination-agriculture.dto';

@Injectable()
export class AgricultureService {
  private readonly logger = new LoggerService(AgricultureService.name)

  constructor(
    private readonly prismaService: PrismaService
  ) { }

  // CREATE NEW AGRICULTURE DATA
  async create(createAgricultureDto: Prisma.AgricultureCreateInput) {
    try {
      const creationResult = await this.prismaService.agriculture.create({
        data: createAgricultureDto
      })
      if (creationResult) {
        return {
          status: 201,
          message: "Successfully saved Agriculture data",
          data: creationResult
        }
      } else return {
        status: 400,
        message: 'Could not save Agriculture data',
        data: null
      }
    } catch (error) {
      this.logger.error(`Failed to create environment\n ${error}`, AgricultureService.name)
      throw new HttpException('Failed to create environment', HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  // GET ALL AGRICULTURE DATA
  async findAll(query: Partial<PaginationAgricultureDto> | any, company_id: string) {

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
      const [total, agriculture] = await this.prismaService.$transaction([
        this.prismaService.agriculture.count(),
        this.prismaService.agriculture.findMany({
          where: {
            ...where, company_id
          }
        })
      ])
      if (agriculture.length) {
        return {
          status: 200,
          message: "Successfully fetched agriculture",
          data: agriculture
        }
      }
      return {
        status: 400,
        message: "FAiled to fetch all agricultures data",
        data: null
      }

    } catch (error) {
      this.logger.error(`Failed to fetch all agriculture data \n ${error}`, AgricultureService.name);
      throw new HttpException('Failed to find all agriculture data', HttpStatus.NOT_FOUND)
    }
  }

  // FIND ONE AGRICULTURE RECORD BY ID
  async findOne(id: string) {
    try {
      const singleAgricultureData = await this.prismaService.agriculture.findUnique({
        where: {
          id
        }
      })
      if (singleAgricultureData) {
        return {
          status: HttpStatus.OK,
          message: "Successfully fetch single record",
          data: singleAgricultureData
        }
      } else return {
        status: HttpStatus.NOT_FOUND,
        message: "No such record  in database",
        data: null
      }
    } catch (error) {
      this.logger.error(`Failed to fetch all environment data \n ${error}`, AgricultureService.name);
      throw new HttpException('Failed to find single agriculture data', HttpStatus.NOT_FOUND)
    }
  }

  // UPDATE AGRICULTURE DATA
  async update(id: string, updateAgricultureDto: Prisma.AgricultureUpdateInput) {
    try {

      const result = await this.prismaService.$transaction(async (tx) => {
        const res = await this.prismaService.environment.update({
          data: updateAgricultureDto,
          where: {
            id
          }
        })
        return res
      })
      if (result) {
        return {
          status: 204,
          message: "Agriculture updtated successfully",
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
        AgricultureService.name)
    }
    throw new InternalServerErrorException("Can't update record")
  }

  // DELETE AGRICULTURE DATA
  async delete(id: string) {
    try {

      // CHECK IF REORD EXIST
      const existingAgriculture = await this.prismaService.agriculture.findUnique({
        where: { id }
      })
      if (typeof existingAgriculture == "undefined") return {
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
          message: "Agriculture record deleted successfully"
        }
      } else {
        return {
          status: HttpStatus.BAD_REQUEST,
          messgage: "Failed to delete agriculture record",
          data: null
        }
      }


    } catch (error) {
      this.logger.error(`Can't delete environment record of id ${id} \n\n ${error}`, AgricultureService.name)
      throw new InternalServerErrorException("Can't delete data agriculture")
    }
  }
}
