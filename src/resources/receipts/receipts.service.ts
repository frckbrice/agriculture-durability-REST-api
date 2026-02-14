import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { Prisma, User } from '@prisma/client';
import { LoggerService } from 'src/global/logger/logger.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { FarmersService } from '../farmers/farmers.service';
import { ReceiptWorker } from './worker-receipts';



@Injectable()
export class ReceiptService {
  private readonly logger = new LoggerService(ReceiptService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly farmerService: FarmersService,
    private readonly receiptWorker: ReceiptWorker
  ) { }


  async createOne(
    createReceiptDto: CreateReceiptDto,
    company_id: string
  ) {

    // avoid creating receipt twice
    let farmer: any, result: any;

    if (!createReceiptDto?.agent_signature || !createReceiptDto?.farmer_signature) {
      throw new HttpException(`Invalid receipt, No signature provided`, HttpStatus.BAD_REQUEST);
    }

    try {

      // in case of newly created farmer: we create the farmer first and then create the receipt
      if (createReceiptDto?.farmer?.farmer_ID_card_number) {

        const { farmer, ...res } = createReceiptDto;
        result = await this.prismaService.$transaction(async (tx) => {

          const newFarmer = await this.farmerService.create({
            farmer_ID_card_number: farmer?.farmer_ID_card_number,
            farmer_name: farmer?.farmer_name,
            farmer_contact: farmer?.farmer_contact,
            inspector_contact: farmer?.inspector_contact,
            village: farmer?.village,
            inspector_name: res?.agent_name,
            council: farmer?.location,
            certification_year: '1970', // mock year. set to this if no year of certif provided.
            company_id,
            inspection_date: res?.date,
            pesticide_quantity: 0,
            pesticide_used: "",
            weed_application: "",
            weed_application_quantity: 0,
          });

          if (!newFarmer?.data)
            throw new InternalServerErrorException('Failed to create farner receipt');

          console.log("farmer created: ", newFarmer);

          const result = await tx.receipt.create({
            data: {
              agent_name: res?.agent_name,
              agent_signature: res?.agent_signature,
              farmer_signature: res?.farmer_signature,
              date: res?.date,
              farmer_id: <string>newFarmer?.data?.id,
              village: <string>newFarmer?.data?.village,
              currency: res?.currency,
              gpsLocation: res?.gpsLocation,
              humidity: String(res?.humidity),
              market_id: res?.market_id,
              net_weight: res?.net_weight,
              price_per_kg: String(res?.price_per_kg),
              product_name: res?.product_name,
              refraction: String(res?.refraction),
              salePhotoUrl: res?.salePhotoUrl,
              total_price: res?.total_price,
              weight: String(res?.weight),
            }
          });

          console.log("receipt created: ", result);

          return result;
        });

      } else if (createReceiptDto?.farmer_id) { // in case of existing farmer, we create the receipt directly.
        result = await this.prismaService.receipt.create({
          data: {
            agent_name: createReceiptDto?.agent_name,
            agent_signature: createReceiptDto?.agent_signature,
            farmer_signature: createReceiptDto?.farmer_signature,
            date: createReceiptDto?.date,
            farmer_id: createReceiptDto?.farmer_id,
            village: createReceiptDto?.village,
            currency: createReceiptDto?.currency,
            gpsLocation: createReceiptDto?.gpsLocation,
            humidity: String(createReceiptDto?.humidity),
            market_id: createReceiptDto?.market_id,
            net_weight: createReceiptDto?.net_weight,
            price_per_kg: String(createReceiptDto?.price_per_kg),
            product_name: createReceiptDto?.product_name,
            refraction: String(createReceiptDto?.refraction),
            salePhotoUrl: createReceiptDto?.salePhotoUrl,
            total_price: createReceiptDto?.total_price,
            weight: String(createReceiptDto?.weight),
          }
        });
      }

      if (result) {
        return {
          data: result,
          status: HttpStatus.CREATED,
          message: `receipt created successfully`,
        };
      }
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to create receipt`,
        };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error(
          `Error while creating receipt ${error.name}: Validation error \n\n ${error}`,
          ReceiptService.name,
        );
        throw new InternalServerErrorException(
          `Validation Error while creating receipt `
        );
      }

    }
  }


  // bulk create receipt if many are sent at once
  async bulkCreate(
    createReceiptDto: CreateReceiptDto[],
    company_id: string): Promise<{
      data: string,
      status: number,
      message: string,
    } | undefined> {

    if (!company_id)
      throw new HttpException(`company ID company id must be provided`, HttpStatus.BAD_REQUEST);

    if (createReceiptDto?.length) {

      const data = {
        receipts: createReceiptDto,
        company_id
      };

      try {
        // we pass to a worker to free the main thread
        const result = await this.receiptWorker.storeReceiptData(JSON.stringify(data));

        console.log("\n\n result: ", result, "\n\n");
        /**
         * {
            "data": {
                "farmersCreated": 5,
                "totalFarmers": 5,
                "receiptsCreated": 5,
                "duplicatesSkipped": 0,
                "success": true
            },
            "status": 201,
            "message": "Receipts created successfully"
        }
         */

        if (!result)
          return {
            data: '',
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Failed to create Receipts.`,
          };
        return {
          data: result,
          status: HttpStatus.CREATED,
          message: `Receipts created successfully`,
        };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientValidationError) {
          this.logger.error(
            `Error while creating receipts in bulk ${error.name}: Validation error \n\n ${error}`,
            ReceiptService.name,
          );
          throw new InternalServerErrorException(
            `Validation Error while creating receipts in bulk `
          );
        }
      }
    }



  }

  async findAll(query: any, company_id: string) {
    // find all the receipt with the latest start date with its status and type
    const { page, perPage, market_id } = query;

    const where: any = {
      company_id,
      ...(market_id && { id: market_id }),
    };

    const queryOptions = {
      where,
      take: perPage ?? 20,
      skip: (page ?? 0) * (perPage ?? 20 - 1),
      orderBy: {
        created_at: 'desc' as const, // Explicitly use SortOrder type
      },
    };
    // find all the companies
    try {
      const [total, receipts] = await this.prismaService.$transaction([
        this.prismaService.receipt.count(),
        this.prismaService.receipt.findMany(queryOptions),
      ]);
      if (receipts.length)
        return {
          status: 200,
          message: 'receipts fetched successfully',
          data: receipts,
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
      else
        return {
          status: 400,
          message: 'No receipts found',
          data: [],
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
    } catch (error) {
      this.logger.error(
        `Error fetching receipts \n\n ${error}`,
        ReceiptService.name,
      );
      throw new NotFoundException('Error fetching receipts');
    }
  }

  async findOne(receipt_id: string,) {
    try {
      const result = await this.prismaService.receipt.findUnique({
        where: {
          id: receipt_id,
        }
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `receipt fetched successfully`,
        };
      else
        return {
          data: null,
          status: 404,
          message: `NOT FOUND receipt with id: "${receipt_id}"`,
        };
    } catch (err) {
      this.logger.error("Can't find a receipt with id ", ReceiptService.name);
      throw new NotFoundException("Can't find a receipt with id " + receipt_id);
    }
  }

  async update(id: string, updateReceiptDto: Prisma.ReceiptUpdateInput) {

    // make sure the receipt exists
    const existingReceipt = await this.prismaService.receipt.findUnique({
      where: {
        id,
      }
    })

    if (!existingReceipt)
      throw new HttpException(`NO receipt with id: ${id}`, HttpStatus.BAD_REQUEST)

    try {
      const result = await this.prismaService.receipt.update({
        data: updateReceiptDto,
        where: {
          id,
        },
      });

      if (result)
        return {
          data: result,
          status: 204,
          message: `receipt updated successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to update receipt`,
        };
    } catch (err) {
      this.logger.error(
        "Can't update a receipt with id " + id,
        ReceiptService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a receipt with id " + id,
      );
    }
  }

  async remove(receipt_id: string) {

    // make sure the receipt exists
    const existingReceipt = await this.prismaService.receipt.findUnique({
      where: {
        id: receipt_id,
      }
    })

    if (!existingReceipt)
      throw new HttpException(`NO receipt with id: ${receipt_id}`, HttpStatus.BAD_REQUEST)

    try {
      const result = await this.prismaService.receipt.delete({
        where: {
          id: receipt_id,
        },
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `receipt deleted successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to delete receipt`,
        };
    } catch (err) {
      this.logger.error(
        "Can't delete a receipt with receipt_id " + receipt_id,
        ReceiptService.name,
      );
      throw new InternalServerErrorException(
        "Can't delete a receipt with receipt_id " + receipt_id,
      );
    }
  }

  // get all companies
}
