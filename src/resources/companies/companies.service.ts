import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { CompanyStatus, Prisma, Role, User, UserStatus } from '@prisma/client';
import { PaginationCompanyQueryDto } from './dto/paginate-company.dto';
import { LoggerService } from 'src/global/logger/logger.service';
import { UsersService } from '../users/users.service';
import { Slugify } from 'src/global/utils/slugilfy';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CompanyService {
  private readonly logger = new LoggerService(CompanyService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private slugifyService: Slugify,
    private eventEmitter: EventEmitter2,
  ) { }


  async create(
    createCompanyDto: Prisma.CompanyCreateInput,
    user: Partial<User>,
  ) {
    // avoid creating company twice
    console.log('\n\ncompany payload: ', createCompanyDto);

    const company = await this.prismaService.company.findFirst({
      where: {
        OR: [
          { email: createCompanyDto.email },
          { head_office_email: createCompanyDto.email }
        ]
      },
    });
    if (company)
      return {
        data: company,
        status: 409,
        message: `Company ${createCompanyDto.name} already exists or the head office email should be different`,
      };
    try {
      const { email, head_office_email } = createCompanyDto;
      const result = await this.prismaService.$transaction(async (tx) => {
        const result = await tx.company.create({
          data: {
            ...createCompanyDto,
            slug: this.slugifyService.slugify(createCompanyDto.name),
            head_office_email: head_office_email ?? email,
            status: CompanyStatus.INACTIVE, // has not yet subscribe to a price plan.
          },
        });

        // We create the user object here. This is a design decision. because we need to create the ADG along with its company. May be updated later.
        const new_user = await tx.user.create({
          data: {
            id: <string>user.id,  // we assign the clerk user Id to our Prisma user
            first_name: <string>user.first_name,
            email: <string>user.email,
            role: <Role>user.role,
            company_id: <string>result.id,
            status: UserStatus.ACTIVE,
          }
        });



        if (!new_user && result) {
          await tx.company.delete({
            where: {
              id: result.id,
            }
          })

          throw new InternalServerErrorException('Failed  to create company');
        }


        this.logger.log(`start emitting company.created`, CompanyService.name);
        // send message for company created in senwisetool system
        this.eventEmitter.emit('company.created', result);
        return result;
      });
      if (result)
        return {
          data: result,
          status: HttpStatus.CREATED,
          message: `company created successfully `,
        };
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to create company`,
        };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error(
          `Error while creating company ${error.name}: Validation error \n\n ${error}`,
          CompanyService.name,
        );
        throw new InternalServerErrorException(
          `Validation Error while creating company ` + createCompanyDto.name,
        );
      }
      this.logger.error(
        `Error while creating company ${createCompanyDto.name} \n\n ${error}`,
        CompanyService.name,
      );
      throw new InternalServerErrorException(
        `Error while creating company ` + createCompanyDto.name,
      );
    }
  }

  async findAll(query: Partial<PaginationCompanyQueryDto>) {
    // find all the company with the latest start date with its status and type
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
      const [total, comapnies] = await this.prismaService.$transaction([
        this.prismaService.company.count(),
        this.prismaService.company.findMany(Query),
      ]);
      if (comapnies.length)
        return {
          status: 200,
          message: 'comapnies fetched successfully',
          data: comapnies,
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
      else
        return {
          status: 400,
          message: 'No comapnies found',
          data: [],
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
    } catch (error) {
      this.logger.error(
        `Error fetching comapnies \n\n ${error}`,
        CompanyService.name,
      );
      throw new NotFoundException('Error while fetching comapnies');
    }
  }

  async findOne(company_id: string) {
    try {
      const result = await this.prismaService.company.findUnique({
        where: {
          id: company_id,
        },
        include: {
          subscription: {
            include: {
              price: true
            }
          }
        }
      });


      if (result)
        return {
          data: result,
          status: 200,
          message: `company fetched successfully`,
        };
      else
        return {
          data: null,
          status: 404,
          message: `NO FOUND company with id: "${company_id}"`,
        };
    } catch (err) {
      this.logger.error("Can't find a company with id ", CompanyService.name);
      throw new NotFoundException("Can't find a company with id " + company_id);
    }
  }

  async update(id: string, updateCompanyDto: Prisma.CompanyUpdateInput) {
    try {
      const result = await this.prismaService.company.update({
        data: updateCompanyDto,
        where: {
          id,
        },
      });

      if (result)
        return {
          data: result,
          status: 204,
          message: `company updated successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to update company`,
        };
    } catch (err) {
      this.logger.error(
        "Can't update a company with id " + id,
        CompanyService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a company with id " + id,
      );
    }
  }

  async remove(company_id: string) {
    try {
      const result = await this.prismaService.company.delete({
        where: {
          id: company_id,
        },
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `company deleted successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to delete company`,
        };
    } catch (err) {
      this.logger.error(
        "Can't delete a company with company_id " + company_id,
        CompanyService.name,
      );
      throw new InternalServerErrorException(
        "Can't delete a company with company_id " + company_id,
      );
    }
  }

  // get all companies
}