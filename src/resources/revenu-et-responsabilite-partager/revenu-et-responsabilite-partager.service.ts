import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { PaginationRevenuDto } from './dto/pagination-revenu-et-responsabilite.dto';

@Injectable()
export class RevenuEtResponsabilitePartagerService {
  private readonly logger = new LoggerService(RevenuEtResponsabilitePartagerService.name)

  constructor(
    private readonly prismaService: PrismaService
  ) { }

  async create(createRevenuDto: Prisma.RevenuEtResponsabilitePartagerCreateInput) {
    try {
      const creationResult = await this.prismaService.revenuEtResponsabilitePartager.create({
        data: createRevenuDto
      })
      if (creationResult) {
        return {
          status: 201,
          message: "Record created successfully",
          data: creationResult
        }
      } else return {
        status: 400,
        message: 'Could not save record',
        data: null
      }

    } catch (error) {
      this.logger.error(`Failed to create record on revenu et responsabilité partagé\n ${error}`, RevenuEtResponsabilitePartagerService.name)
      throw new HttpException('Failes to create record on Revenu-et-responsabilité-partagé', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async findAll(query: Partial<PaginationRevenuDto> | any, company_id: string) {
    const { page, perPage, activity_title, type } = query
    let where = Object.create({})
    let Query = Object.create(where)

    if (activity_title) where["activity_title"] = activity_title
    if (type) where["type"] = type

    Query = {
      ...Query,
      take: perPage ?? 20,
      skip: (page ?? 0) * (perPage ?? 20 - 1),
      orderBy: {
        created_at: 'desc'
      }
    }

    try {
      const [total, revenu] = await this.prismaService.$transaction([
        this.prismaService.revenuEtResponsabilitePartager.count(),
        this.prismaService.revenuEtResponsabilitePartager.findMany({
          where: {
            ...where, company_id
          }
        })
      ])
      if (revenu) {
        return {
          status: 200,
          message: 'Successfully fetched all revenu',
          data: revenu
        }
      } else return {
        status: 400,
        message: "No data recorded",
        data: null
      }
    } catch (error) {
      this.logger.error(`Failed to fetch all Revenu data \n ${error}`, RevenuEtResponsabilitePartagerService.name);
      throw new HttpException('Failed to find all revenu data', HttpStatus.NOT_FOUND)
    }

  }

  // FIND ONE RECORD BY ID
  async findOne(id: string) {
    try {
      const singleRevenu = await this.prismaService.revenuEtResponsabilitePartager.findUnique({
        where: { id }
      })
      if (singleRevenu) {
        return {
          status: HttpStatus.OK,
          message: "Successfully fetch single record",
          data: singleRevenu
        }
      } else return {
        status: HttpStatus.NOT_FOUND,
        message: "No such record in database",
        data: null
      }
    } catch (error) {
      this.logger.error(`Failed to fetch all environment data \n ${error}`, RevenuEtResponsabilitePartagerService.name);
      throw new HttpException('Failed to find single agriculture data', HttpStatus.NOT_FOUND)
    }
  }

  // UPDATE SINGLE REVENU
  async update(id: string, updateRevenuDto: Prisma.RevenuEtResponsabilitePartagerCreateInput) {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const res = await this.prismaService.revenuEtResponsabilitePartager.update({
          data: updateRevenuDto,
          where: {
            id
          },

        })
        return res
      })
      if (result) {
        return {
          status: 204,
          message: "Revenu updated successfully",
          data: result
        }
      } else return {
        status: 400,
        message: "Failed to update record",
        data: null
      }
     } catch (error) {
      console.log(error)
      this.logger.error(`Can't update social record of id ${id} \n ${error}`,
        RevenuEtResponsabilitePartagerService.name)
    }
    throw new InternalServerErrorException("Can't update record")
  }

  // DELETE RECORD
  async delete(id: string) {
    try {
      const existingRecord = await this.prismaService.revenuEtResponsabilitePartager.findUnique({
        where: {id},

      })
      if (typeof existingRecord == "undefined") return {
        data: null,
        message: "No record with such id",
        status: HttpStatus.BAD_REQUEST
      }
      const result = await this.prismaService.revenuEtResponsabilitePartager.delete({
        where: {id}
      })
      if (result) {
        return {
          data: result,
          status: HttpStatus.NO_CONTENT,
          message: "Successfully deleted record"
        }
      } else {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Failed to delete record",
          data: null
        }
      }
    } catch (error) {
      this.logger.error(`Can't delete Revenu record of id ${id} \n\n ${error}`, RevenuEtResponsabilitePartagerService.name)
      throw new InternalServerErrorException("Can't delete data revenu")
    }
  }


}
