import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { PaginationSocialDto } from './dto/pagination-social.dto';

@Injectable()
export class SocialService {
  private readonly logger = new LoggerService(SocialService.name)
  
  constructor(
    private readonly prismaService: PrismaService
  ) { }

  // CREATE NEW SOCIAL DATA
  async create(createSocialDto: Prisma.SocialCreateInput) {
    try {
      const creationResult = await this.prismaService.social.create({
        data: createSocialDto
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
      this.logger.error(`Failed to create environment\n ${error}`, SocialService.name)
      throw new HttpException('Failed to create environment', HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  // GET ALL SOCIAL DATA
  async findAll(query: Partial<PaginationSocialDto> | any, company_id: string) {
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
      const [total, social] = await this.prismaService.$transaction([
        this.prismaService.social.count(),
        this.prismaService.social.findMany({
          where: {
            ...where, company_id
          }
        })
      ])
      if (social.length) {
        return {
          status: 200,
          message: "Successfully fetched social",
          data: social
        }
      }
      return {
        status: 400,
        message: "FAiled to fetch all social data",
        data: null
      }
    } catch (error) {

      this.logger.error(`Failed to fetch all agriculture data \n ${error}`, SocialService.name);
      throw new HttpException('Failed to find all agriculture data', HttpStatus.NOT_FOUND)
    }
  }

  // FIND ONE SOCIAL RECORD BY ID
  async findOne(id: string) {
    try {
      const singleSocialRecord = await this.prismaService.social.findUnique({
        where: {
          id
        }
      })
      if (singleSocialRecord) {
        return {
          status: HttpStatus.OK,
          message: "Successfully fetch single record",
          data: singleSocialRecord
        }
      } else return {
        status: HttpStatus.NOT_FOUND,
        message: "No such record  in database",
        data: null
      }
    } catch (error) {
      this.logger.error(`Failed to fetch all environment data \n ${error}`, SocialService.name);
      throw new HttpException('Failed to find single agriculture data', HttpStatus.NOT_FOUND)
    }
  }

  // UPDATE SOCIAL DATA
  async update(id: string, updateSocialDto: Prisma.SocialUpdateInput) {

    try {

      const result = await this.prismaService.$transaction(async (tx) => {
        const res = await this.prismaService.environment.update({
          data: updateSocialDto,
          where: {
            id
          }
        })
        return res
      })
      if (result) {
        return {
          status: 204,
          message: "Social updtated successfully",
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
        SocialService.name)
    }
    throw new InternalServerErrorException("Can't update record")
  }

  // DELETE AGRICULTURE DATA
  async delete(id: string) {
    try {

      // CHECK IF REORD EXIST
      const existingSocial = await this.prismaService.agriculture.findUnique({
        where: { id }
      })
      if (typeof existingSocial == "undefined") return {
        data: null,
        message: "No environment record with such id",
        status: HttpStatus.BAD_REQUEST
      }
      const result = await this.prismaService.social.delete({
        where: {
          id
        }
      })

      if (result) {
        return {
          data: result,
          status: HttpStatus.NO_CONTENT,
          message: "Social record deleted successfully"
        }
      } else {
        return {
          status: HttpStatus.BAD_REQUEST,
          messgage: "Failed to delete Social record",
          data: null
        }
      }


    } catch (error) {
      this.logger.error(`Can't delete Social record of id ${id} \n\n ${error}`, SocialService.name)
      throw new InternalServerErrorException("Can't delete data Social")
    }
  }
}
