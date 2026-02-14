import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { Prisma, User } from '@prisma/client';
import { LoggerService } from 'src/global/logger/logger.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';


@Injectable()
export class TransactionService {
  private readonly logger = new LoggerService(TransactionService.name);

  constructor(
    private readonly prismaService: PrismaService,
  ) { }

  async create(
    createTransactionDto: Prisma.TransactionCreateInput,
    user: Partial<User>,
  ) {
    try {
      console.log('\n\ntransaction payload: ', createTransactionDto);

      const transaction = await this.prismaService.transaction.create({
        data: createTransactionDto,
      });

      if (!transaction) {
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to create transaction',
        };
      }

      console.log('\n\ntransaction result: ', transaction);

      return {
        data: transaction,
        status: HttpStatus.CREATED,
        message: 'Transaction created successfully',
      };

    } catch (error) {
      this.logger.error(
        `Error creating transaction: ${error.message}`,
        TransactionService.name,
      );

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new InternalServerErrorException(
          'Validation Error while creating transaction'
        );
      }

      // Handle other potential Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002': // Unique constraint violation
            throw new ConflictException('Transaction already exists');
          case 'P2003': // Foreign key constraint violation
            throw new BadRequestException('Invalid reference in transaction data');
          default:
            throw new InternalServerErrorException('Error creating transaction');
        }
      }

      throw new InternalServerErrorException('Error creating transaction');
    }
  }

  async findAll(query: any) {
    // find all the transaction with the latest start date with its status and type
    const { page, perPage, market_id } = query;
    const where = Object.create({});

    if (market_id)
      where['market_id'] = market_id;

    let Query = Object.create({ where });
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
      const [total, transactions] = await this.prismaService.$transaction([
        this.prismaService.transaction.count(),
        this.prismaService.transaction.findMany(Query),
      ]);
      if (transactions.length)
        return {
          status: 200,
          message: 'transactions fetched successfully',
          data: transactions,
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
      else
        return {
          status: 400,
          message: 'No transactions found',
          data: [],
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
    } catch (error) {
      this.logger.error(
        `Error fetching transactions \n\n ${error}`,
        TransactionService.name,
      );
      throw new NotFoundException('Error fetching transactions');
    }
  }

  async findOne(transaction_id: string) {
    try {
      const result = await this.prismaService.transaction.findUnique({
        where: {
          id: transaction_id,
        }
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `transaction fetched successfully`,
        };
      else
        return {
          data: null,
          status: 404,
          message: `NOT FOUND transaction with id: "${transaction_id}"`,
        };
    } catch (err) {
      this.logger.error("Can't find a transaction with id ", TransactionService.name);
      throw new NotFoundException("Can't find a transaction with id " + transaction_id);
    }
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {

    // check if the transaction  already exists
    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id,
      },
    });
    if (!transaction)
      return {
        data: null,
        status: 404,
        message: `NOT FOUND transaction with id: "${id}"`,
      };

    // console.log("\n\n incoming transaction payload: ", updateTransactionDto);
    try {
      const result = await this.prismaService.transaction.update({
        data: {
          ...updateTransactionDto,
          sender_name: updateTransactionDto?.sender_name,
          receiver_name: updateTransactionDto?.receiver_name,
          market_number: updateTransactionDto?.market_number,
          minister_agent_name: updateTransactionDto?.minister_agent_name,
          vehicule_immatriculation_number: updateTransactionDto?.vehicule_immatriculation_number,
          driver_name: updateTransactionDto?.driver_name,
          // normally this number of bags should be the same as the number of bags declared in accompanying sheet.
          number_of_bags_for_transmission: Number(updateTransactionDto?.number_of_bags_for_transmission),
          product_quality: updateTransactionDto?.product_quality,
          sender_signature: updateTransactionDto?.sender_signature,
          driver_signature: updateTransactionDto?.driver_signature,

          min_com_sig: updateTransactionDto?.min_com_sig,
          date_transmission: updateTransactionDto?.date_transmission,

        },
        where: {
          id,
        },
      });

      console.log("\n\n result of update transaction: ", result);

      if (!result)
        return {
          data: null,
          status: 400,
          message: `Failed to update transaction`,
        };
      else
        return {
          data: result,
          status: 200,
          message: `transaction updated successfully`,
        };
    } catch (err) {
      this.logger.error(
        `Can't update a transaction with id  + ${id} \n\n ${err}`,
        TransactionService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a transaction with id " + id,
      );
    }
  }

  async remove(transaction_id: string) {
    try {
      const result = await this.prismaService.transaction.delete({
        where: {
          id: transaction_id,
        },
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `transaction deleted successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to delete transaction`,
        };
    } catch (err) {
      this.logger.error(
        "Can't delete a transaction with transaction_id " + transaction_id,
        TransactionService.name,
      );
      throw new InternalServerErrorException(
        "Can't delete a transaction with transaction_id " + transaction_id,
      );
    }
  }

  // get all companies
}
