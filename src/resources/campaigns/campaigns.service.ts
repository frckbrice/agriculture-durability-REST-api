import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { Campaign, CampaignStatus, Prisma, User } from '@prisma/client';
import { PaginationCampaignQueryDto } from './dto/paginate-campaign.dto';
import { LoggerService } from 'src/global/logger/logger.service';


@Injectable()
export class CampaignService {
  private readonly logger = new LoggerService(CampaignService.name);

  constructor(private readonly prismaService: PrismaService) { }

  async create(
    createCampaignDto: Prisma.CampaignCreateInput,
    user: Partial<User>,
  ) {
    // avoid creating campaign twice

    const campaign = await this.prismaService.campaign.findFirst({
      where: {
        name: createCampaignDto.name,
      },
    });
    if (campaign)
      return {
        data: campaign,
        status: 409,
        message: `Campaign ${createCampaignDto.name} already exists`,
      };
    try {
      const result = await this.prismaService.campaign.create({
        data: createCampaignDto,
      });
      if (result)
        return {
          data: result,
          status: HttpStatus.CREATED,
          message: `campaign created successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Failed to create campaign`,
        };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error(
          `Error while creating campaign ${error.name}: Validation error \n\n ${error}`,
          CampaignService.name,
        );
        throw new InternalServerErrorException(
          `Validation Error while creating campaign ` + createCampaignDto.name,
        );
      }
      this.logger.error(
        `Error while creating campaign ${createCampaignDto.name} \n\n ${error}`,
        CampaignService.name,
      );
      throw new InternalServerErrorException(
        `Error while creating campaign ` + createCampaignDto.name,
      );
    }
  }

  async findAll(query: Partial<PaginationCampaignQueryDto>) {
    // find all the campaign with the latest start date with its status and type
    const { status, page, perPage } = query;
    let Query = Object.create({});

    if (page)
      Query["take"] = +page;
    if (page && perPage) {
      Query["take"] = +page;
      Query["skip"] = (+page) * (+perPage - 1);
    }

    Query = {
      ...Query,
      orderBy: {
        start_date: 'desc',
      },
    };
    // find all the companies
    try {
      const [total, campaigns] = await this.prismaService.$transaction([
        this.prismaService.campaign.count(),
        this.prismaService.campaign.findMany(Query),
      ]);

      if (campaigns.length)
        return {
          status: HttpStatus.OK,
          message: 'campaigns fetched successfully',
          data: campaigns,
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 10,
          totalPages: Math.ceil(total / (query.perPage ?? 10)),
        };
      else
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'No campaigns found',
          data: [],
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 10,
          totalPages: Math.ceil(total / (query.perPage ?? 10)),
        };
    } catch (error) {
      this.logger.error(
        `Error fetching campaigns \n\n ${error}`,
        CampaignService.name,
      );
      throw new HttpException('Error fetching campaigns', HttpStatus.NOT_FOUND);
    }
  }

  async findOne(campaign_id: string) {
    try {
      const result = await this.prismaService.campaign.findUnique({
        where: {
          id: campaign_id,
        },
      });

      if (result)
        return {
          data: result,
          status: HttpStatus.OK,
          message: `campaign fetched successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.NOT_FOUND,
          message: `No campaign with id: "${campaign_id}"`,
        };
    } catch (err) {
      this.logger.error("Can't find a campaign with id ", CampaignService.name);
      throw new NotFoundException(
        "Can't find a campaign with id " + campaign_id,
      );
    }
  }

  async update(id: string, updateCampaignDto: Prisma.CampaignUpdateInput) {
    try {
      const result = await this.prismaService.campaign.update({
        data: updateCampaignDto,
        where: {
          id,
        },
      });

      if (result)
        return {
          data: result,
          status: 204,
          message: `campaign updated successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to update campaign`,
        };
    } catch (err) {
      this.logger.error(
        "Can't update a campaign with id " + id,
        CampaignService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a campaign with id " + id,
      );
    }
  }

  async remove(campaign_id: string) {
    try {
      const result = await this.prismaService.campaign.delete({
        where: {
          id: campaign_id,
        },
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `campaign deleted successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to delete campaign`,
        };
    } catch (err) {
      this.logger.error(
        "Can't delete a campaign with campaign_id " + campaign_id,
        CampaignService.name,
      );
      throw new InternalServerErrorException(
        "Can't delete a campaign with campaign_id " + campaign_id,
      );
    }
  }

  // get the current campaign
  async getCurrentCampaign(): Promise<{
    name: string,
    id: string
  } | null> {
    const currentDate = new Date();

    const currentAcademicYearStart = new Date(currentDate.getFullYear(), 0, 1); // get the first day of the current year
    const currentAcademicYearEnd = new Date(currentDate.getFullYear() + 1, 0, 0); // get the last day of December of the current year,

    // console.log("curent year start: ", currentAcademicYearStart);
    // console.log("curent year end: ", currentAcademicYearEnd);

    const campaign = await this.prismaService.campaign.findFirst({
      where: {
        AND: [
          { start_date: { gte: currentAcademicYearStart } },
          { end_date: { lte: currentAcademicYearEnd } },
          { status: CampaignStatus.OPEN }, // Assuming ACTIVE is the status for current campaigns
        ],
      },
      select: {
        name: true,
        id: true
      },
      orderBy: [{ start_date: 'asc' }],
    });

    return {
      name: <string>campaign?.name,
      id: <string>campaign?.id,
    }
  }


}
