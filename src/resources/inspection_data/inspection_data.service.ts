import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { FieldWorkerHost } from './worker-host';
import { FarmWorkerHost } from './worker-host-farm';
import { AttendanceSheetWorker } from './worker-host-training';

const resourceList = ['initial_inspection', 'mapping', 'trainings']

@Injectable()
export class InspectionDataService {
  private readonly logger = new LoggerService(InspectionDataService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly fieldWorker: FieldWorkerHost,
    private readonly farmWorker: FarmWorkerHost,
    private readonly attendenceSheetWorker: AttendanceSheetWorker,
  ) { }
  async create(
    createInspectionDatumDto: Prisma.Inspection_dataCreateInput & { council?: string },
    type: string,
    company_id?: string,
  ) {
    let status: boolean = false;

    console.log("\n\n data from mobile: ", createInspectionDatumDto);
    console.log("\n\ntype : ", type);
    let city: string;
    // get the council from the   incoming mobile data
    if (createInspectionDatumDto?.council) {
      city = createInspectionDatumDto?.council;
    }

    const { council, ...res } = createInspectionDatumDto

    // type is used to Identify which project is being uploaded.
    // this triggers a specific operation like storing farmer data at initial inspection only .
    let data;

    try {
      if (type.toString().toLocaleLowerCase().includes('auto_evaluation')) {
        data = await this.prismaService.inspection_data.create({
          data: res,
        });
      }
      else {
        // data = await this.prismaService.$transaction(async () => {
        data = await this.prismaService.inspection_data.create({
          data: res,
        });
        if (data) {
          // store the data for farmer via the worker thread
          // council here is added because we are trying to fetch farmer from mobile later based on location/city.
          if (type.toString().toLocaleLowerCase().includes('_inspection')) {
            const result = await this.fieldWorker.storeFarmerData(JSON.stringify({ ...data, council }));
            if (typeof result != 'undefined' && result) {
              console.log("farmer  created successfully: ", result);
              status = true
            }

          }
          // store data for  farm 
          if (type.toString().toLocaleLowerCase().includes('mapping')) {
            const result = await this.farmWorker.storeFarmData(JSON.stringify({ ...data, company_id, council }));
            if (typeof result != 'undefined' && result) {
              console.log("\n\nfarm data  registered successfully: ", result)
              status = true;
            }
          }

          if (type.toString().toLocaleLowerCase().includes('training')) {
            const result = await this.attendenceSheetWorker.storeAttendanceData(JSON.stringify(data));
            if (typeof result != 'undefined' && result) {
              console.log("\n\participants and attendance of this training project registered successfully: ", result)
              status = true;
            }
          }
        }



      }

      if (data) {
        return {
          data,
          status: HttpStatus.CREATED,
          message: `Project collected data was stored successfully in DB
            ${status && type.includes('initial_inspection') ? 'farmer also created during this' + `${type}` : ''}
          `
        }
      }

      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to store project collected data.`
        }
    } catch (error) {
      this.logger.error(
        `Failed to store project collected data , ${error}`,
        InspectionDataService.name,
      );
      throw new InternalServerErrorException('Failed to store project collected data');
    }
  }

  //TODO: create pagination for inspection_data resource
  async findAll(query: { project_id: string; page?: number; perPage?: number }) {
    try {
      console.log('project_id from inspetion_data table', query.project_id)
      if (query?.project_id) {
        const [total, inspectionData] = await this.prismaService.$transaction([
          this.prismaService.inspection_data.count({}),
          this.prismaService.inspection_data.findMany({
            where: {
              project_id: query?.project_id,
            },
            take: query?.page ?? 20,
            skip: (query?.page ?? 0) * (query?.perPage ?? 20 - 1),
            orderBy: {
              collected_at: 'desc',
            },
          }),
        ]);
        console.log('inspection data from service\n', inspectionData)
        return {
          total,
          data: inspectionData,
          page: query?.page ?? 0,
          perPage: query?.perPage ?? 20,
          totalPages: Math.ceil(total / (query?.perPage ?? 20)),
        };
      }
      //TODO: return right object here
      return this.prismaService.inspection_data.findMany({});
    } catch (error) {
      this.logger.error(
        'can find all the inspection data',
        InspectionDataService.name,
      );
      throw new NotFoundException('can find all the inspection data');
    }
  }

  // Find all data collected for a particular project
  async getAll(id: string) {
    try {
      const result = await this.prismaService.inspection_data.findMany({
        where: {
          project_id: id
        }
      })
      if (result.length) {
        return {
          data: result,
          message: "This are inspection all inspection data for this project",
          status: 201
        }
      } else return {
        status: HttpStatus.NOT_FOUND,
        message: "Data not found",
        data: null
      }


    } catch (error) {
      this.logger.error(
        "Can't Fetch project collected data with project_id" + id + '\n\n ' + error,
        InspectionDataService.name,
      );
      throw new InternalServerErrorException(
        "Can't Fetch project collected data with project_id" + id,
      );
    }
  }

  async findOne(id: string) {
    try {
      const result = await this.prismaService.inspection_data
        .findUnique({
          where: {
            id,
          },
        })

      if (typeof result != 'undefined' && result)
        return {
          data: result,
          status: 201,
          message: `Project collected data successfully updated`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Can't Fetch project collected data with id`,
        };
    }
    catch (err) {
      this.logger.error(
        "Can't Fetch project collected data with id" + id + '\n\n ' + err,
        InspectionDataService.name,
      );
      throw new InternalServerErrorException(
        "Can't Fetch project collected data with id" + id,
      );
    }
  }

  async update(
    id: string,
    updateProjectDatumDto: Prisma.Inspection_dataUpdateInput,
  ) {

    try {
      const result = await this.prismaService.inspection_data
        .update({
          where: {
            id,
          },
          data: updateProjectDatumDto,
        })

      if (typeof result != 'undefined' && result)
        return {
          data: null,
          status: 204,
          message: `project collected data successfully updated`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to update project collected data`,
        };
    }
    catch (err) {
      this.logger.error(
        "Can't update a inspection project data with id" + id + '\n\n ' + err,
        InspectionDataService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a inspection project with id  " + id,
      );
    }
  }

  async remove(id: string) {
    try {
      const result = await this.prismaService.project
        .delete({
          where: {
            id,
          },
        })

      if (typeof result != 'undefined' && result)
        return {
          data: null,
          status: 204,
          message: `project collected data deleted successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to project collected data deleted`,
        };
    }
    catch (err) {
      this.logger.error(
        "Can't delete a project collected data with id  " + id + '\n\n ' + err,
        InspectionDataService.name,
      );
      throw new InternalServerErrorException(
        "Can't delete project collected data with id " + id,
      );
    }
  }
}
