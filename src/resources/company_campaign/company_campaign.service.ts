import { Injectable } from '@nestjs/common';
import { CreateCompanyCampaignDto } from './dto/create-company_campaign.dto';
import { UpdateCompanyCampaignDto } from './dto/update-company_campaign.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/adapters/config/prisma.service';

@Injectable()
export class CompanyCampaignService {
  constructor(private prismaService: PrismaService) {}

  create(createCompanyCampaignDto: Prisma.Company_CampaignCreateInput) {
    //  create a ccmpany alon
  }

  // get all the companies that belong to a specific compaign.
  findAll() {
    return `This action returns all companyCampaign`;
  }

  findOne(id: string) {
    return `This action returns a #${id} companyCampaign`;
  }

  update(id: string, updateCompanyCampaignDto: UpdateCompanyCampaignDto) {
    return `This action updates a #${id} companyCampaign`;
  }

  remove(id: string) {
    return `This action removes a #${id} companyCampaign`;
  }

  // async getAllCompaniesForSingleCampaign(campaign_name: string) {

  //   const data = await this.prismaService.company.findMany({
  //     where: {
  //       campaigns: {
  //         some: {
  //           name: campaign_name
  //         }
  //       }
  //     }
  //   })
  // }
}
