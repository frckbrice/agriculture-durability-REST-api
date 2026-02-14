/*
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';

const prisma = new PrismaClient();
type PostCreateBody = Prisma.Args<
  typeof prisma.price_plan_requirement,
  'create'
>['data'];

@Injectable()
export class RequirementPricePlanService {
  constructor(private prismaService: PrismaService) {}

  private readonly logger = new LoggerService(RequirementPricePlanService.name);
  async create(createRequirementPricePlanDto: PostCreateBody) {
    try {
      const data = await this.prismaService.price_plan_requirement.create({
        data: createRequirementPricePlanDto,
      });

      if (data)
        return {
          status: 201,
          data,
          message: 'success fetching requirement price plan',
        };
      else
        return {
          status: 404,
          data: [],
          message: 'No requirements for this price plan found',
        };
    } catch (error) {
      this.logger.error(
        `Error creating requirements for the plan id: ${createRequirementPricePlanDto.price_plan_id} \n\n ${error}`,
        RequirementPricePlanService.name,
      );
      throw new HttpException(
        'Error creating comapnies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllRequirements(query: { price_plan_id?: string }) {
    try {
      const { price_plan_id } = query;
      //filter the request
      // Object.create() isn't supported in some legacy browsers
      const where = {} as { price_plan_id: string | undefined };
      if (price_plan_id) where['price_plan_id'] = price_plan_id ?? '';
      const data = await this.prismaService.price_plan_requirement.findMany({
        where,
      });

      if (data && data.length)
        return {
          status: 200,
          data,
          message: 'success fetching requirement price plan',
        };
      else
        return {
          status: 404,
          data: [],
          message: 'No requirements for this price plan found',
        };
    } catch (error) {
      this.logger.error(
        `Error fetching requirements for this plan id: ${query.price_plan_id} \n\n ${error}`,
        RequirementPricePlanService.name,
      );
      throw new NotFoundException('Error fetching comapnies');
    }
  }

  async update(
    id: string,
    updateRequirementPricePlanDto: Prisma.Price_plan_requirementUpdateInput,
  ) {
    try {
      const data = await this.prismaService.price_plan_requirement.update({
        where: {
          id,
        },
        data: updateRequirementPricePlanDto,
      });

      if (data)
        return {
          status: 204,
          data,
          message: 'success updating requirement price plan',
        };
      else
        return {
          status: 404,
          data: null,
          message: 'No requirements for this price plan found',
        };
    } catch (error) {
      this.logger.error(
        `Error updating requirements for this plan id: ${id} \n\n ${error}`,
        RequirementPricePlanService.name,
      );
      throw new HttpException(
        'Error updating comapnies',
        HttpStatus.NOT_MODIFIED,
      );
    }
  }

  remove(id: string) {
    return `This action removes a #${id} requirementPricePlan`;
  }
}
*/
