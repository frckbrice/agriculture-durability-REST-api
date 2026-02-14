import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { Prisma, ProjectStatus, User } from '@prisma/client';
import { LoggerService } from 'src/global/logger/logger.service';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { UsersService } from '../users/users.service';
import { Slugify } from 'src/global/utils/slugilfy';
import { PaginationTrainingQueryDto } from './dto/paginate-training.dto';
import { generateMapping, getUUIDFromCode } from '../projects/create-code-project-mapping';
import { title } from 'node:process';
import { ProjectAssigneeService } from '../project-assignee/project-assignee.service';

@Injectable()
export class TrainingService {
  private readonly logger = new LoggerService(TrainingService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private slugifyService: Slugify,
    private projectAssigneeService: ProjectAssigneeService
  ) { }

  async create(
    createTrainingDto: Prisma.TrainingCreateInput,
    user: Partial<User>,
  ) {
    //TDOO: look if possible to avoid creating training twice


    try {
      // create a mapping code
      const { uuid, code: training_code } = generateMapping(crypto.randomUUID());
      await this.projectAssigneeService.create({
        agentCode: training_code,
        projectCodes: [uuid],
        company_id: <string>user?.company_id
      })
      console.log("after training creation: ", "training_code: ", training_code, "uuid: ", uuid)


      const result = await this.prismaService.training.create({
        data: {
          ...createTrainingDto,
          slug: this.slugifyService.slugify(createTrainingDto.title),
          code: uuid,
          deployed_at: "1970-01-01T00:00:00+01:00",
          archived_at: "1970-01-01T00:00:00+01:00",
          deleted_at: "1970-01-01T00:00:00+01:00",
          updated_at: "1970-01-01T00:00:00+01:00",
        },
      });

      if (result)
        return {
          data: { ...result, code: training_code },
          status: 201,
          message: `training created successfully`,
        };
      else
        return {
          data: null,
          status: 500,
          message: `Failed to create training`,
        };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error(
          `Error while creating training ${error.name}: Validation error \n\n ${error}`,
          TrainingService.name,
        );
        throw new InternalServerErrorException(
          `Validation Error while creating training ` + createTrainingDto.title,
        );
      }
      this.logger.error(
        `Error while creating training ${createTrainingDto.title} \n\n ${error}`,
        TrainingService.name,
      );
      throw new InternalServerErrorException(
        `Error while creating training ` + TrainingService.name,
      );
    }
  }

  async findAll(query: Partial<PaginationTrainingQueryDto> | any, company_id: string) {
    // find all the training with the latest start date with its status and type
    const { page, perPage, location, agentCode } = query;
    console.log({ page, perPage, location })

    if (agentCode) {
      return this.getAllAssignedProjects(agentCode, company_id)
    }


    let where = Object.create({});
    let Query = Object.create(where)
    if (location)
      where["location"] = location // TODO: check this work deeply later

    Query = {
      ...Query,
      take: perPage ?? 20,
      skip: (page ?? 0) * (perPage ?? 20 - 1),
      orderBy: {
        start_date: 'desc',
      },
    };

    // find all the company
    try {
      const [total, trainings] = await this.prismaService.$transaction([
        this.prismaService.training.count(),
        this.prismaService.training.findMany({
          where: {
            ...where,
            company_id
          }
        }),
      ]);
      // console.log("trainings:", trainings)
      if (trainings.length) {

        // get the list of project uuid code
        const listOfUuidCodes = trainings?.map((p) => p.code);
        // get all the corresponding 4 digits codes for each project
        const assignees =
          await this.projectAssigneeService
            .getAllTheAssigneesCodesFromAListOfProjectUuidsOfACompany(listOfUuidCodes as string[], <string>company_id);

        // Create mapping for matching uuids
        const mappedList = assignees?.data?.flatMap(assignee =>
          assignee.projectCodes
            .filter(uuid => listOfUuidCodes.includes(uuid))
            .map(uuid => ({
              agentCode: assignee.agentCode,
              uuid: uuid
            }))
        );
        // assign coresponding code to each project.
        const projectResponse = mappedList?.reduce((acc, curr, index) => {
          if (acc.find(p => p.code === curr.uuid)) {
            const val = acc[index]
            acc = [...acc, { ...val, code: curr.agentCode }]
          }
          return acc
        }, trainings);

        return {
          status: 200,
          message: 'trainings fetched successfully',
          data: projectResponse,
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
      } else
        return {
          status: 404,
          message: 'No trainings found',
          data: [],
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
    } catch (error) {
      this.logger.error(
        `Error fetching trainings \n\n ${error}`,
        TrainingService.name,
      );
      throw new NotFoundException('Error fetching trainings');
    }
  }

  //  // get all the projects assigned to an agent
  async getAllAssignedProjects(agentCode: string, company_id?: string) {
    try {
      // get list of projects codes assigned to this agent
      const listOfCodes = (await this.projectAssigneeService.findOne(agentCode))?.data; // return list of uuids code of the project
      if (listOfCodes?.length) {
        let listOfUuids, projects;
        if (listOfCodes.length === 1) {
          console.log("listOfCodes get one uuid: ", listOfCodes);
          // get all oject having the the uuid
          const [codeVal] = listOfCodes;
          projects = await this.prismaService.training.findMany({
            where: {
              code: codeVal,
              status: ProjectStatus.DEPLOYED,
              company_id: company_id,
            },
            select: {
              status: true,
              id: true,
              title: true,
              company_id: true

            },
          });
          console.log("current project : ", projects)
        } else {
          console.log("listOfCodes get multiple code: ", listOfCodes);
          listOfUuids = await this.projectAssigneeService.getAllTheUuidsFromTheCodesList(listOfCodes);
          projects = await this.prismaService.training.findMany({
            where: {
              code: {
                in: listOfUuids
              },
              status: ProjectStatus.DEPLOYED,
              company_id
            },
            select: {
              status: true,
              id: true,
              title: true,
              company_id: true,
              location: true,
            },
          });
        }
        // const listOfUuids = await this.projectAssigneeService.getAllTheUuidsFromTheCodesList(listOfCodes)

        // get all oject having the the uuid
        // const projects = await this.prismaService.training.findMany({
        //   where: {
        //     code: {
        //       in: [...listOfUuids!]
        //     },
        //     status: ProjectStatus.DEPLOYED,
        //     company_id
        //   },
        //   select: {
        //     status: true,
        //     id: true,
        //     title: true,

        //   },
        // });
        if (typeof projects != 'undefined' && projects.length) {

          return {
            data: projects,
            status: HttpStatus.OK,
            message: "sucessfully fetched projects assigned to this agent",
          }
        }

        return {
          data: [],
          status: HttpStatus.BAD_REQUEST,
          message: "Failed to fetch projects assigned to this agent",
        }

      } else return {
        data: [],
        status: HttpStatus.BAD_REQUEST,
        message: "This code has No projects assigned to.",
      }

    } catch (err) {
      this.logger.error(`Failed to fetch projects assigned to this agent \n\n ${err}`, TrainingService.name);
      throw new HttpException('Failed to fetch projects assigned to this agent', HttpStatus.NOT_FOUND);
    }
  }

  async findOne(training_id: string) {

    console.log("from findOne training with id: ", training_id)
    try {
      const result = await this.prismaService.training.findUnique({
        where: {
          id: training_id,
        },
      });

      if (result)
        return {
          data: result,
          status: HttpStatus.OK,
          message: `training fetched successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to fetch training`,
        };
    } catch (err) {
      this.logger.error(
        `Can't find a training with title: ${training_id} \n\n ${err}`,
        TrainingService.name,
      );
      throw new NotFoundException(
        "Can't find a training with id " + training_id,
      );
    }
  }

  // get a training project by its code
  async findTrainingProjectByItsCode(training_code: string) {
    // match the code with the corresponding uuid saved for this training
    const retrievedUUID = getUUIDFromCode(training_code);

    console.log("from training controller, retrievedUUID: ", retrievedUUID);

    if (typeof retrievedUUID == 'undefined') // check for null or undefined
      throw new HttpException(`No matching training code for this code`, HttpStatus.BAD_REQUEST)

    try {
      const result = await this.prismaService.training.findMany({
        where: {
          code: <string>retrievedUUID,
          status: ProjectStatus.DEPLOYED,

        },
        include: {
          company: {
            select: {
              name: true,
            },
          },

        },
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `training fetched successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to fetch training`,
        };
    } catch (err) {
      this.logger.error(
        `Can't find a training with training_code ${training_code} \n\n ${err}`,
        TrainingService.name,
      );
      throw new NotFoundException(
        "Can't find a training with training_code " + training_code,
      );
    }
  }

  async update(id: string, updateTrainingDto: Prisma.TrainingUpdateInput) {
    try {
      const result = await this.prismaService.training.update({
        data: updateTrainingDto,
        where: {
          id,
        },
      });

      if (result)
        return {
          data: result,
          status: 204,
          message: `training updated successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to update training`,
        };
    } catch (err) {
      this.logger.error(
        `Can't update a training with id ${id} \n\n ${err} `,
        TrainingService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a training with id " + id,
      );
    }
  }

  async updateTraining({
    id,
    user_id,
    updateTrainingDto,
  }: {
    id: string;
    user_id: string;
    updateTrainingDto: Prisma.TrainingUpdateInput;
  }) {

    // check if the training exists first
    const existingTraining = await this.findOne(id);
    if (typeof existingTraining == 'undefined')
      return {
        data: null,
        status: HttpStatus.BAD_REQUEST,
        message: `No training with this ID`,
      };

    console.log("the existing training dto: ", existingTraining)
    console.log("the updated  training dto\n\n: ", updateTrainingDto)
    // check the type of action and set the corresponding date
    if (updateTrainingDto.hasOwnProperty('status')) {
      if (updateTrainingDto.status === ProjectStatus.ARCHIVED) {
        updateTrainingDto.archived_at = new Date().toISOString();
        updateTrainingDto.deployed_at = existingTraining.data?.deployed_at;
        updateTrainingDto.draft_at = existingTraining.data?.draft_at;
        updateTrainingDto.deleted_at = existingTraining.data?.deleted_at;

      }
      //  deployed
      if (updateTrainingDto.status === ProjectStatus.DEPLOYED) {
        updateTrainingDto.deployed_at = new Date().toISOString();
        updateTrainingDto.archived_at = existingTraining.data?.archived_at;
        updateTrainingDto.draft_at = existingTraining.data?.draft_at;
        updateTrainingDto.deleted_at = existingTraining.data?.deleted_at;
      }

      // deleted
      if (updateTrainingDto.status === ProjectStatus.DELETED) {
        updateTrainingDto.deployed_at = existingTraining.data?.deployed_at;
        updateTrainingDto.archived_at = existingTraining.data?.archived_at;
        updateTrainingDto.draft_at = existingTraining.data?.draft_at;
        updateTrainingDto.deleted_at = new Date().toISOString();
      }
    }

    console.log("updated dto:\n\n ", updateTrainingDto)
    try {
      const result = await this.prismaService.training.update({
        data: updateTrainingDto,
        where: {
          id,
        },
      });

      if (result)
        return {
          data: result,
          status: HttpStatus.OK, // the resource is return to be used by the client
          message: `training updated successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to update training`,
        };
    } catch (err) {
      this.logger.error(
        `Can't update a training with id  ${id} \n\n ${err}`,
        TrainingService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a training with id " + id,
      );
    }
  }

  async remove(training_id: string) {

    // check if the project exists first
    const existingTraining = await this.findOne(training_id);
    if (typeof existingTraining == 'undefined')
      return {
        data: null,
        status: HttpStatus.BAD_REQUEST,
        message: `No training with this ID`,
      };


    try {
      const result = await this.prismaService.training.delete({
        where: {
          id: training_id,
        },
      });

      if (result)
        return {
          data: result,
          status: HttpStatus.NO_CONTENT,
          message: `training deleted successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to delete training`,
        };
    } catch (err) {
      this.logger.error(
        `Can't delete a training with training_id ${training_id} \n\n ${err}`,
        TrainingService.name,
      );
      throw new InternalServerErrorException(
        "Can't delete a training with training_id " + training_id,
      );
    }
  }



  // PHONE SERVICEs REQUEST
  async findAllFromPhone(query: Partial<PaginationTrainingQueryDto>, company_id: string) {
    // find all the training with the latest start date with its status and type
    const { page, perPage, location } = query;
    console.log({ page, perPage, location })

    let where = Object.create({});
    let Query = Object.create(where)
    if (location)
      where.location = location

    Query = {
      ...Query,
      select: {
        id: true,
        title: true,
        modules: true,
        status: true
      },
      take: perPage ?? 20,
      skip: (page ?? 0) * (perPage ?? 20 - 1),
      orderBy: {
        start_date: 'desc',
      },
    };
    // find all the companies
    try {
      const [total, trainings] = await this.prismaService.$transaction([
        this.prismaService.training.count(),
        this.prismaService.training.findMany(Query),
      ]);
      console.log("trainings:", trainings)
      if (trainings.length)
        return {
          status: 200,
          message: 'trainings fetched successfully',
          data: trainings,
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
      else
        return {
          status: 404,
          message: 'No trainings found',
          data: [],
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
    } catch (error) {
      this.logger.error(
        `Error fetching trainings \n\n ${error}`,
        TrainingService.name,
      );
      throw new NotFoundException('Error fetching trainings');
    }
  }
}
