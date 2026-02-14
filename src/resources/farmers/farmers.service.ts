import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { Prisma } from '@prisma/client';
import { LoggerService } from 'src/global/logger/logger.service';

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FarmersService {
  private readonly logger = new LoggerService(FarmersService.name);

  constructor(
    private readonly prismaService: PrismaService,
    // private slugifyService: Slugify,
    private eventEmitter: EventEmitter2,
  ) { }


  async create(
    createFarmerDto: Prisma.FarmerCreateInput,
  ) {
    // avoid creating farmer twice
    console.log('\n\nfarmer  payload: ', createFarmerDto);

    const farmer = await this.prismaService.farmer.findFirst({
      where: {
        OR: [
          { farmer_ID_card_number: createFarmerDto.farmer_ID_card_number },
          { farmer_contact: createFarmerDto.farmer_contact },
        ]
      },
    });
    if (farmer)
      return {
        data: farmer,
        status: 409,
        message: `Farmer ${createFarmerDto.farmer_name} already exists`,
      };
    try {

      const result = await this.prismaService.farmer.create({
        data: {
          ...createFarmerDto,
        },
      });
      if (result)
        return {
          data: result,
          status: HttpStatus.CREATED,
          message: `farmer created successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to create farmer`,
        };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error(
          `Error while creating farmer ${error.name}: Validation error \n\n ${error}`,
          FarmersService.name,
        );
        throw new InternalServerErrorException(
          `Validation Error while creating farmer ` + createFarmerDto.farmer_name,
        );
      }
    }
  }

  async findAll(query: any, company_id: string) {
    // find all the farmer with the latest start date with its status and type
    const { page, perPage, location, phone, name } = query;

    const where: any = {
      company_id,
      ...(location && { council: { contains: location } }),
      ...(name && { farmer_name: name })
    };

    const queryOptions = {
      where,
      take: perPage ?? 20,
      skip: (page ?? 0) * (perPage ?? 20 - 1),
      orderBy: {
        created_at: 'desc' as const, //Explicitly use SortOrder type
      },
    };

    console.log({ queryOptions })
    // find all the companies
    try {
      // Fetch total count with the same filters and the paginated farmers
      const [total, farmers] = await this.prismaService.$transaction([
        this.prismaService.farmer.count({ where }),
        this.prismaService.farmer.findMany(queryOptions),
      ]);

      if (farmers.length)
        return {
          status: 200,
          message: 'farmers fetched successfully',
          data: phone ? farmers?.map((f) => ({
            farmer_name: f.farmer_name,
            farmer_id: f.id,
            farmer_ID_card_number: f.farmer_ID_card_number,
            village: f.village,
            farmer_contact: f.farmer_contact
          })) : farmers,
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
      else
        return {
          status: 400,
          message: 'No farmers found',
          data: [],
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
    } catch (error) {
      this.logger.error(
        `Error fetching farmers \n\n ${error}`,
        FarmersService.name,
      );
      throw new NotFoundException('Error fetching farmers ');
    }
  }

  async findOne(farmer_id: string) {
    try {
      const result = await this.prismaService.farmer.findUnique({
        where: {
          id: farmer_id,
        }
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `farmer fetched successfully`,
        };
      else
        return {
          data: null,
          status: 404,
          message: `NO FOUND farmer with id: "${farmer_id}"`,
        };
    } catch (err) {
      this.logger.error("Can't find a farmer with id ", FarmersService.name);
      throw new NotFoundException("Can't find a farmer with id " + farmer_id);
    }
  }

  async update(id: string, updateFarmerDto: Prisma.FarmerUpdateInput) {
    try {
      const result = await this.prismaService.farmer.update({
        data: updateFarmerDto,
        where: {
          id,
        },
      });

      if (result)
        return {
          data: result,
          status: 204,
          message: `farmer updated successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to update farmer`,
        };
    } catch (err) {
      this.logger.error(
        "Can't update a farmer with id " + id,
        FarmersService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a farmer with id " + id,
      );
    }
  }

  async remove(farmer_id: string) {
    try {
      const result = await this.prismaService.farmer.delete({
        where: {
          id: farmer_id,
        },
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `farmer deleted successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to delete farmer`,
        };
    } catch (err) {
      this.logger.error(
        "Can't delete a farmer with farmer_id " + farmer_id,
        FarmersService.name,
      );
      throw new InternalServerErrorException(
        "Can't delete a farmer with farmer_id " + farmer_id,
      );
    }
  }

  // get all companies
}
