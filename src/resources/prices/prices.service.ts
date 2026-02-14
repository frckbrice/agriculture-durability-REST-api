import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePriceDto } from './dto/update-price.dto';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { CurrentPlanIds } from 'src/global/utils/current-plan-ids';
// import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PricesService {
  private logger = new LoggerService(PricesService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly currenPlanIds: CurrentPlanIds,
    // private readonly subscriptionService: SubscriptionsService
  ) { }

  async create(createPriceDto: Prisma.Price_planCreateInput) {
    // validate plan id

    try {
      const result = await this.prismaService.price_plan.create({
        data: createPriceDto,
      });

      if (result)
        return {
          status: 201,
          data: result,
          message: 'Price plan created successfully',
        };
      else
        return {
          status: 500,
          data: null,
          message: 'Failed to create price plan',
        };
    } catch (e) {
      console.error(`\n\nError while creating price plan ${e}`);
      this.logger.error(
        `Error while creating price plan ${e}`,
        PricesService.name,
      );
      throw new InternalServerErrorException('Failed to create price plan');
    }
  }

  async findAll() {
    try {
      const resutls = await this.prismaService.price_plan.findMany({});

      if (resutls.length > 0)
        return {
          status: 200,
          data: resutls,
          message: 'Price plans fetched successfully',
        };
      else
        return {
          status: 404,
          data: null,
          message: 'Failed to fetch price plans',
        };
    } catch (error) {
      console.error(`\n\nError while fetching price plans: \n\n  ${error}`);
      this.logger.error(
        `Error while fetching price plans: \n\n  ${error}`,
        PricesService.name,
      );
      throw new NotFoundException('Failed to fetch price plans');
    }
  }

  private price_plans = ['bronze', 'silver', 'gold'];
  async findOne(plan_name: string) {

    const where = {} as any;
    if (!this.price_plans.some(plan => plan_name.toLocaleLowerCase().includes(plan)))
      throw new NotFoundException(`Plan ${plan_name} not found`);

    console.log("\n\n inside plan service where: ", where);

    try {
      const resutl = await this.prismaService.price_plan.findUnique({
        where: {
          plan_name
        },
        select: {
          id: true,
          plan_name: true,
          billing_cycle: true,
          product_name: true,
        },
      });
      console.log('\n\n price plan findOne service: ', resutl);
      if (resutl && resutl.id)
        return {
          status: 200,
          data: resutl,
          message: 'Price plan fetched successfully',
        };
      else
        return {
          status: 404,
          data: null,
          message: 'Failed to fetch price plan',
        };
    } catch (error) {
      console.error(`\n\nError while fetching price plan: \n\n  ${error}`);
      this.logger.error(
        `Error while fetching price plan: \n\n  ${error}`,
        PricesService.name,
      );
      throw new NotFoundException(' Failed to fetch price plan');
    }
  }

  async findCurrentcompanyPlan(company_id: string) {

    // get current company subscrition
    // const currentCompanySubscription = await this.subscriptionService.getLastValidSubscription(company_id)

    try {
      /*
        this design (line 139-149) is not legal as it is not following SRP from SOLID method. 
        but it's a technical debt that will be updated later. for now we can go with it since 
        it is solving current issue of dependencies ...
      */
      const currentCompanySubscription = await this.prismaService.subscription.findFirst({
        where: {
          AND: [
            { company_id, },
            { status: SubscriptionStatus.ACTIVE },
          ]
        },
        select: {
          plan_id: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      if (typeof currentCompanySubscription == 'undefined')
        throw new HttpException(`Company has not subscribed on this plan`, HttpStatus.FORBIDDEN);

      const resutl = await this.prismaService.price_plan.findUnique({
        where: {
          id: currentCompanySubscription?.plan_id
        },
        select: {
          id: true,
          plan_name: true,
        },
      });

      console.log("current pice plan:", resutl);
      if (resutl && resutl.id)
        return {
          status: 200,
          data: resutl,
          message: 'CurrentPrice plan fetched successfully',
        };
      else
        return {
          status: 404,
          data: null,
          message: 'Failed to fetch current price plan',
        };
    } catch (error) {
      console.error(`\n\nError while fetching current price plan : \n\n  ${error}`);
      this.logger.error(
        `Error while fetching current price plan: \n\n  ${error}`,
        PricesService.name,
      );
      throw new NotFoundException(' Failed to fetch price plan');
    }
  }

  // update the price item with the current price plan id

  async update(id: string, updatePriceDto: Prisma.Price_planCreateInput) {
    try {
      // check first if the item price with this Id exists
      const itemPrice = await this.prismaService.price_plan.findUnique({
        where: { id },
      });

      if (!itemPrice) {
        throw new NotFoundException(`Price with id ${id} not found`);
      }

      // then delete the item price
      await this.prismaService.price_plan.update({
        where: { id },
        data: updatePriceDto
      });

      return {
        status: 200,
        data: null,
        message: 'Price plan updated successfully',
      };

    } catch (error) {
      this.logger.error(
        `Error while updating price plan with id ${id} \n\n ${error}`,
        PricesService.name,
      );
      throw new HttpException('Error while updating price plan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // remove the price with id 
  async remove(id: string) {
    try {
      // check first if the item price with this Id exists
      const itemPrice = await this.prismaService.price_plan.findUnique({
        where: { id },
      });

      if (!itemPrice) {
        throw new NotFoundException(`Price with id ${id} not found`);
      }

      // then delete the item price
      await this.prismaService.price_plan.delete({
        where: { id },
      });

      return {
        status: 200,
        data: null,
        message: 'Price plan deleted successfully',
      };

    } catch (error) {
      this.logger.error(
        `Error while deleting price plan with id ${id} \n\n ${error}`,
        PricesService.name,
      );
      throw new HttpException('Error while deleting price plan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
