import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { Prisma, ProjectStatus, TypeProject } from '@prisma/client';
import { PaginationProjectQueryDto } from './dto/paginate-project.dto';
import { LoggerService } from 'src/global/logger/logger.service';
import { Slugify } from 'src/global/utils/slugilfy';
import { generateMapping, getUUIDFromCode } from './create-code-project-mapping';
import { ProjectAssigneeService } from '../project-assignee/project-assignee.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new LoggerService(ProjectsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private slugify: Slugify,
    private projectAssigneeService: ProjectAssigneeService
  ) { }


  async create({
    createProjectDto,
    company_id,
  }: {
    createProjectDto: Prisma.ProjectCreateInput;
    company_id: string;
  }) {

    if (!company_id)
      throw new HttpException(`No company ID. cannot create project`, HttpStatus.FORBIDDEN);

    // avoid creating the same project twice with the same title
    const project = await this.prismaService.project.findFirst({
      where: {
        slug: this.slugify.slugify(createProjectDto.title),
      },
    });

    if (project !== null) {
      console.log("after checking duplicate :existing, ", project);
      return {
        data: project,
        status: 409,
        message: `Project  "${createProjectDto.title}" already exists`,
      };
    }

    // validate date so that end date should be greater than start date
    if (createProjectDto.start_date > createProjectDto.end_date)
      return {
        data: null,
        status: HttpStatus.BAD_REQUEST,
        message: `End date should be greater than or equal to start date`,
      };

    try {


      const { uuid: UID, code: projectCode } = generateMapping(crypto.randomUUID());
      const assignee = await this.projectAssigneeService.create({
        agentCode: projectCode,
        projectCodes: [UID],
        company_id,
        project_type: createProjectDto.type
      })

      console.log("from project service assignee created : ", assignee);

      const result = await this.prismaService.project.create({
        data: {
          ...createProjectDto,
          slug: this.slugify.slugify(createProjectDto.title),
          code: UID,
          deployed_at: "1970-01-01T00:00:00+01:00",
          archived_at: "1970-01-01T00:00:00+01:00",
          deleted_at: "1970-01-01T00:00:00+01:00",
          updated_at: "1970-01-01T00:00:00+01:00",
        },
      });

      if (result) {
        return {
          data: { ...result, code: projectCode },
          status: 201,
          message: `project created successfully`,
        };
      }

      else
        return {
          data: null,
          status: 400,
          message: `Failed to create project`,
        };
    } catch (error) {
      this.logger.error(
        `Error while creating project ${error}`,
        ProjectsService.name,
      );
      throw new InternalServerErrorException(`Error while creating project`);
    }
  }

  // get all company's projects code
  async findAllProjectCodesOfCompany(query: Partial<PaginationProjectQueryDto> | any, company_id: string) {
    const { campaign_id, type } = query
    console.log("fetching all project codes")
    try {
      const [total, projects] = await this.prismaService.$transaction([
        this.prismaService.project.count(),
        this.prismaService.project.findMany({
          where: {
            company_id,
            campaign_id
          },
          select: {
            id: true,
            type: true,
            code: true,
            title: true,
          },
          orderBy: {
            start_date: 'desc',
          },
        }),
      ]);

      if (typeof projects != 'undefined' && projects.length) {
        // get the list of project uuid code
        const listOfUuidCodes = projects?.map((p) => p.code);
        // get all the corresponding 4 digits codes for each project
        const assignees =
          await this.projectAssigneeService
            .getAllTheAssigneesCodesFromAListOfProjectUuidsOfACompany(listOfUuidCodes, <string>company_id);

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
        }, projects);

        // send only projects with 4 digit code
        let result: any[] = []
        if (projectResponse) {
          for (const item of projectResponse) {
            if (item.code.length < 5) {
              result.push(item)
            }
          }
        }

        return {
          status: 200,
          message: 'projects fetched successfully',
          data: result,
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
      }

      else
        return {
          status: 404,
          message: 'No projects found',
          data: [],
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
    } catch (error) {
      this.logger.error('Error fetching projects', ProjectsService.name);
      throw new NotFoundException('Error fetching projects');
    }

  }

  async findAll(query: Partial<PaginationProjectQueryDto> | any, company_id: string) {

    console.log('\n\ncompany_id and query: ', company_id, query)
    const { status, type, page, perPage, search, campaign_id, } = query;

    const where = Object.create({ company_id });

    console.log('first where clause \n', where)
    let Query = Object.create({ where });

    console.log({ campaign_id, company_id }) // log campaign and company
    if (status) {
      where['status'] = status;
    }

    if (type) {
      where['type'] = type;
    }

    if (campaign_id) {
      where['campaign_id'] = campaign_id;
    }

    if (search)
      where["search"] = search

    // if (search)
    //   where["search"] = search
    console.log("incoming request before query.agentCode: ", query, "company_id: ", company_id)

    // if we have assigned a query to the uri, we just return the corresponding function.
    if (query.agentCode)
      return this.getAllAssignedProjects(query.agentCode, company_id);

    let q = Object.create({ where });
    console.log("incoming request  after query.agentCode : ", query)
    const queryOptions = {
      where,
      take: perPage ?? 20,
      skip: (page ?? 0) * (perPage ?? 20 - 1),
      orderBy: {
        start_date: 'desc' as const,
      },
    };

    // for each project, assign its 4 dgits code
    // find all the project with the latest start date with its status and type
    try {
      const [total, projects] = await this.prismaService.$transaction([
        this.prismaService.project.count({ where }),
        this.prismaService.project.findMany(queryOptions),
      ]);

      if (typeof projects != 'undefined' && projects.length) {
        // get the list of project uuid code
        const listOfUuidCodes = projects?.map((p) => p.code);
        // get all the corresponding 4 digits codes for each project
        const assignees =
          await this.projectAssigneeService
            .getAllTheAssigneesCodesFromAListOfProjectUuidsOfACompany(listOfUuidCodes, <string>company_id);

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
        }, projects);

        return {
          status: 200,
          message: 'projects fetched successfully',
          data: projectResponse,
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20 - 1,
          totalPages: Math.ceil(total / (query.perPage ?? 20 - 1)),
        };
      }

      else
        return {
          status: 404,
          message: 'No projects found',
          data: [],
          total,
          page: query.page ?? 0,
          perPage: query.perPage ?? 20 - 1,
          totalPages: Math.ceil(total / (query.perPage ?? 20)),
        };
    } catch (error) {
      this.logger.error('Error fetching projects', ProjectsService.name);
      throw new NotFoundException('Error fetching projects');
    }
  }

  async findOne(project_id: string) {

    try {
      const result = await this.prismaService.project.findUnique({
        where: {
          id: project_id,
        }
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `project  fetched successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to fetch project`,
        };
    } catch (err) {
      this.logger.error(
        `Can't find a project with project_id ${project_id} \n\n ${err}`,
        ProjectsService.name,
      );
      throw new NotFoundException(
        "Can't find a project with project_id " + project_id,
      );
    }
  }

  async findOneProjectFromPhone(project_code: string) {

    // match the code with the corresponding uuid saved for this project
    const retrievedUUID = getUUIDFromCode(project_code);

    if (typeof retrievedUUID == 'undefined')
      throw new HttpException(`No matching project code for this code`, HttpStatus.BAD_REQUEST)

    try {
      const result = await this.prismaService.project.findUnique({
        where: {
          code: <string>retrievedUUID,
          status: ProjectStatus.DEPLOYED,
          // type: <TypeProject>(type === 'training' ? type : "") // this isn't possible
        },
        select: {
          id: true,
          title: true,
          status: true,
          start_date: true,
          end_date: true,
          project_structure: true,
        }
      });

      if (result)
        return {
          data: result,
          status: 200,
          message: `project fetched successfully`,
        };
      else
        return {
          data: null,
          status: 400,
          message: `Failed to fetch project`,
        };
    } catch (err) {
      this.logger.error(
        `Can't find a project with project_code ${project_code} \n\n ${err}`,
        ProjectsService.name,
      );
      throw new NotFoundException(
        "Can't find a project with project_code " + project_code,
      );
    }
  }

  // find all the ass

  async update({
    id,
    user_id,
    updateProjectDto,
  }: {
    id: string;
    user_id: string;
    updateProjectDto: Prisma.ProjectUpdateInput;
  }) {

    // check if the project exists first
    const existingProject = await this.findOne(id);
    if (typeof existingProject == 'undefined')
      return {
        data: null,
        status: HttpStatus.BAD_REQUEST,
        message: `No project with this ID`,
      };

    console.log("the existing project dto: ", existingProject)
    console.log("the updated  project dto\n\n: ", updateProjectDto)
    // check the type of action and set the corresponding date
    if (updateProjectDto.hasOwnProperty('status')) {
      if (updateProjectDto.status === ProjectStatus.ARCHIVED) {
        updateProjectDto.archived_at = new Date().toISOString();
        updateProjectDto.deployed_at = existingProject.data?.deployed_at;
        updateProjectDto.draft_at = existingProject.data?.draft_at;
        updateProjectDto.deleted_at = existingProject.data?.deleted_at;

      }
      // if (updateProjectDto.status === ProjectStatus.DRAFT) {
      //   updateProjectDto.archived_at = existingProject.data?.archived_at;
      //   updateProjectDto.deployed_at = existingProject.data?.deployed_at;
      //   updateProjectDto.draft_at = new Date().toISOString();
      //   updateProjectDto.deleted_at = existingProject.data?.deleted_at;

      // }
      if (updateProjectDto.status === ProjectStatus.DEPLOYED) {
        updateProjectDto.deployed_at = new Date().toISOString();
        updateProjectDto.archived_at = existingProject.data?.archived_at;
        updateProjectDto.draft_at = existingProject.data?.draft_at;
        updateProjectDto.deleted_at = existingProject.data?.deleted_at;
      }
      if (updateProjectDto.status === ProjectStatus.DELETED) {
        updateProjectDto.deployed_at = existingProject.data?.deployed_at;
        updateProjectDto.archived_at = existingProject.data?.archived_at;
        updateProjectDto.draft_at = existingProject.data?.draft_at;
        updateProjectDto.deleted_at = new Date().toISOString();
      }
    }

    console.log("updated dto:\n\n ", updateProjectDto)
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const result = await this.prismaService.project.update({
          data: updateProjectDto,
          where: {
            id,
          },
        });
        console.log("projectId : ", result.id, "userId: ", user_id)
        // set the project audit to keep track of who did this action
        // await tx.project_audit.create({
        //   where: {
        //     project_id: result.id,
        //     user_id: user_id,
        //   },
        //   data: {
        //     type_of_project: <TypeProject>result.type,
        //     action: <ProjectStatus>result.status
        //   },
        // });

        return result;
      });

      if (result)
        return {
          data: result,
          status: HttpStatus.OK, // the resource is return to be used by the client
          message: `project updated successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to update project`,
        };
    } catch (err) {
      this.logger.error(
        `Can't update a project with id  ${id} \n\n ${err}`,
        ProjectsService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a project with id " + id,
      );
    }
  }
  // update many projects
  async updateMany(projectIds: string[], updateProjectDto: Prisma.ProjectUpdateInput, user_id: string) {

    try {
      const updatedProjects = await this.prismaService.$transaction(async (tx) => {
        // update only existing prejects
        const updatedProjects = Promise.all(projectIds.map(async (project_id) => {
          const existingProject = await this.findOne(project_id);

          if (typeof existingProject != 'undefined' && existingProject)
            return await this.update({
              id: <string>existingProject.data?.id,
              user_id,
              updateProjectDto
            })
        }));
        return updatedProjects;
      })

      if (updatedProjects.length)
        return {
          data: updatedProjects,
          status: HttpStatus.OK, // the resource is return to be used by the client
          message: `project archive successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to archive project`,
        };
    } catch (error) {
      this.logger.error(
        `Can't archieve a project list \n\n ${error}`,
        ProjectsService.name,
      );
      throw new InternalServerErrorException(
        "Can't update a project list",
      );
    }
  }

  // update a single project

  async deleteManyByIds(ids: string[], user_id: string) {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {

        const updatedProjects = Promise.all(ids.map(async (project_id) => {
          const existingProject = await this.findOne(project_id);

          if (typeof existingProject != 'undefined' && existingProject)
            return await this.remove(<string>existingProject.data?.id, user_id)
        }))
        return updatedProjects;
      })

      if (result)
        return {
          data: null,
          status: HttpStatus.NO_CONTENT,
          message: `project list deleted successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to delete project list`,
        };
    } catch (error) {
      this.logger.error(
        "Can't delete a project list with project_ids " + '\n\n ' + error,
        ProjectsService.name,
      );
      throw new InternalServerErrorException(
        "Can't delete a project list with project_ids ",
      );
    }
  }

  // delete a single project
  async remove(project_id: string, user_id: string) {

    // check if the project exists first
    const existingProject = await this.findOne(project_id);
    if (typeof existingProject == 'undefined')
      return {
        data: null,
        status: HttpStatus.BAD_REQUEST,
        message: `No project with this ID`,
      };

    try {
      const result = await this.prismaService.project.delete({
        where: {
          id: project_id,
          deleted_at: new Date().toISOString()
        }
      });
      // const result = await this.prismaService.$transaction(async (tx) => {
      //   const result = await this.prismaService.project.delete({
      //     where: {
      //       id: project_id,
      //     }
      //   });

      //   // set who deleted the project
      //   // await tx.project_audit.delete({
      //   //   where: {
      //   //     id: result.id,
      //   //     user_id: user_id,
      //   //   },
      //   // });

      //   return result;
      // })

      if (result)
        return {
          data: null,
          status: HttpStatus.NO_CONTENT,
          message: `project deleted successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to delete project`,
        };
    } catch (err) {
      this.logger.error(
        "Can't delete a project with project_id " + project_id + '\n\n ' + err,
        ProjectsService.name,
      );
      throw new InternalServerErrorException(
        "Can't delete a project with project_id " + project_id,
      );
    }
  }


  // get all the projects assigned to an agent
  async getAllAssignedProjects(agentCode: string, company_id?: string) {
    try {
      console.log("inside get all assigned projects ");
      // get list of projects codes assigned to this agent
      const listOfCodes = (await this.projectAssigneeService.findOne(agentCode))?.data;
      if (listOfCodes?.length) {

        console.log("list of  codes: ", listOfCodes)
        let listOfUuids, projects;
        if (listOfCodes.length === 1) { // this means that it is a single project.

          // get all oject having the the uuid
          const [codeVal] = listOfCodes;

          projects = await this.prismaService.project.findMany({
            where: {
              code: codeVal,
              status: ProjectStatus.DEPLOYED,
              company_id,
            },
            select: {
              // status: true,
              type: true,
              id: true,
              title: true,
              project_structure: true,
              // campaign_id: true,
              company_id: true,
              city: true
            },
          });
          console.log("current project : ", projects)
        } else {
          console.log("listOfCodes get  multiple code : ", listOfCodes);
          listOfUuids = await this.projectAssigneeService.getAllTheUuidsFromTheCodesList(listOfCodes);
          projects = await this.prismaService.project.findMany({
            where: {
              code: {
                in: listOfUuids
              },
              status: ProjectStatus.DEPLOYED,
              company_id
            },
            select: {
              // status: true,
              type: true,
              id: true,
              title: true,
              project_structure: true,
              // campaign_id: true,
              company_id: true,
              city: true
            },
          });
        }


        console.log("projects: ", projects);


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

      } else return { // there is no project codes for this agent.
        data: [],
        status: HttpStatus.BAD_REQUEST,
        message: "This code has No projects assigned to.",
      }

    } catch (err) {
      this.logger.error(`Failed to fetch projects assigned to this agent \n\n ${err}`, ProjectsService.name);
      throw new HttpException('Failed to fetch projects assigned to this agent', HttpStatus.NOT_FOUND);
    }
  }

}
