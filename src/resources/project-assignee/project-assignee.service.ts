import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProjectAssigneeDto } from './dto/create-project-assignee.dto';
import { UpdateProjectAssigneeDto } from './dto/update-project-assignee.dto';
import { Prisma } from '@prisma/client';
import prisma, { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { AssigneeWorker } from './worker-assignee';

@Injectable()
export class ProjectAssigneeService {

  private logger = new LoggerService(ProjectAssigneeService.name);

  constructor(
    private prismaService: PrismaService,
    private assigneeWorket: AssigneeWorker
  ) { }
  async create(createProjectAssigneeDto: Prisma.AssigneeCreateInput) {

    console.log("from project assignee from servce => ", createProjectAssigneeDto)
    if (!createProjectAssigneeDto?.agentCode || !createProjectAssigneeDto.company_id)
      return {
        status: 400,
        message: "INVALID CREDENTIALS",
        data: null
      }
    try {

      const data = await this.prismaService.assignee.create({
        data: createProjectAssigneeDto
      });
      if (typeof data != 'undefined' && data) {
        console.log("assignee created: ", data)
        return {
          data,
          message: "Project Assigned to this user created successfully",
          status: 201
        }
      }

      return {
        data: null,
        message: "Failed to assign projects to this user",
        status: 400
      }
    } catch (error) {
      this.logger.error(`Failed to assign projects to this user \n\n ${error}`, ProjectAssigneeService.name);
      throw new HttpException('Failed to updated project codes to this user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // create multiple records at a time
  async bulkCreate(createProjectAssigneeDto: Prisma.AssigneeCreateInput[]) {
    try {
      let result = []
      for (const item of createProjectAssigneeDto) {
        const data = await this.prismaService.assignee.create({
          data: item
        })
        result.push(data)
      }
      if (typeof result != "undefined") return {
        data: result,
        message: "All agent code created successfully",
        status: 201
      }
      return {
        data: null,
        message: "Failed to assign projects to this user",
        status: 400
      }
    } catch (error) {
      this.logger.error(`Failed to assign projects to this user \n\n ${error}`, ProjectAssigneeService.name);
      throw new HttpException('Failed to updated project codes to this user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllAssigneeFromThisProject(code?: string) {
    let options = {}

    /*
     * we need all the assignees involved in this project code. 
     * ie all the project assigned to this code
     * since sometimes assignee agencode is a project code
     */

    if (code)
      options = {
        projectCodes: {
          has: code
        }
      }

    try {
      const data = await this.prismaService.assignee.findMany({
        where: options
      });
      if (typeof data != 'undefined' && data.length)
        return {
          data: data?.map((a) => a.agentCode),
          message: "sucessfully fetched project codes assigned to this user",
          status: 200
        }
      return {
        data: null,
        message: "Failed to fetch assigned project codes for this user code",
        status: 400
      }
    } catch (error) {
      this.logger.error(`Failed to fetch assigned project codes for this user \n\n ${error}`, ProjectAssigneeService.name);
      throw new HttpException('Failed to fetch assigned  project codes to this user', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * 
   * @param param0 We need all the projects assigned to this code
   */
  async getAllProjectSAssignedToAgent({ code, company_id }: { code: string, company_id: string }) {
    let options = {}
    // we need all the projects code assigned to this agent code

    console.log('\n\n inside the project Assignee service. code and company_id', { code, company_id });

    if (!company_id) {
      this.logger.error(`Failed to fetch assigned project codes`, ProjectAssigneeService.name);
      throw new HttpException('No company id provided', HttpStatus.BAD_REQUEST);
    }

    if (!code) {
      this.logger.error(`Failed to fetch assigned project codes`, ProjectAssigneeService.name);
      throw new HttpException('No agent code provided', HttpStatus.BAD_REQUEST);
    }

    try {
      // retrieve first the uuid corresponding to this code
      const assignee = await this.prismaService.assignee.findUnique({
        where: {
          agentCode: code || "",
          company_id
        },
        select: {
          projectCodes: true,
        }
      })

      console.log('\n\n inside the project Assignee service. assignee', { assignee });
      if (!assignee) return {
        data: [],
        message: "No such agentCode in this company",
        status: 404
      }

      if (typeof assignee != 'undefined' && assignee?.projectCodes.length) {

        // we get all the assigned uuids corresponding to the list of codes provided
        const listOfUuidsForProjects = await this.getAllTheUuidsFromTheCodesList(assignee?.projectCodes)

        console.log('\n\n inside the project Assignee service. listOfUuidsForProjects', { listOfUuidsForProjects });
        const data = {
          uuidLists: listOfUuidsForProjects,
          company_id,
        }
        // we pass to a worker to free the main thread. this thread should return the list of projects (training, inspections, markets) for this agent.
        const result = await this.assigneeWorket.storeAssigneeData(JSON.stringify(data));

        console.log("\n\n inside the project Assignee service. result: ", result, "\n\n");
        return result
      }


      return {
        data: [],
        message: "Failed to fetch assigned project codes for this user code",
        status: 400
      }
    } catch (error) {
      this.logger.error(`Failed to fetch assigned project codes for this user \n\n ${error}`, ProjectAssigneeService.name);
      throw new HttpException('Failed to fetch assigned  project codes to this user', HttpStatus.NOT_FOUND);
    }

  }

  /**
   * some assignees have as agentCode the project code. so we need to recover 
   * all their uuid which are strings in their corresponding projectCode.
   * see this   const { uuid, code: projectCode } = generateMapping(crypto.randomUUID());
      await this.projectAssigneeService.create({
        agentCode: projectCode,
        projectCodes: [uuid]
      })
   */
  async getAllTheUuidsFromTheCodesList(projectCodes: string[]) {
    try {

      // need all assignees that has agentCode in projectCode list. 
      // then retrieve its uuid since their projectCodes is of length 1.
      const assignees = await this.prismaService.assignee.findMany({
        where: {
          agentCode: {
            in: projectCodes, // Filter assignees where agentCode is in the projectCodes list
          },
        },
        select: {
          projectCodes: true,
          agentCode: true
        }
      });

      console.log("\n\n Retrieved assignees: ", assignees);

      // Flatten and collect all project UUIDs from these assignees
      const allProjectCodes = assignees.flatMap(a => a.projectCodes);
      console.log("\n\n Extracted project codes from assignees: ", allProjectCodes);

      return allProjectCodes;
      // return [];
    } catch (error) {
      this.logger.error(`Failed to fetch assigned project codes UUIDs \n\n ${error}`, ProjectAssigneeService.name);
      throw new HttpException('Failed to fetch assigned  project codes UUIDs', HttpStatus.NOT_FOUND);
    }
  }

  // find all the project of one assignee having this agent code.
  async findAll(company_id: string, agentCode?: string,) {
    let options = {}
    // we need all the projects code assigned to this agent code

    if (!company_id) {
      this.logger.error(`Failed to fetch assigned project codes`, ProjectAssigneeService.name);
      throw new HttpException('No company id provided', HttpStatus.BAD_REQUEST);
    }


    try {
      // retrieve first the uuid corresponding to this code
      const assignee = await this.prismaService.assignee.findUnique({
        where: {
          agentCode: agentCode || "",
          company_id
        },
        select: {
          projectCodes: true,
        }
      })

      if (!assignee) return {
        data: [],
        message: "No such agentCode in this company",
        status: 404
      }

      if (typeof assignee != 'undefined' && assignee?.projectCodes.length)
        return {
          data: assignee?.projectCodes,
          message: "sucessfully fetched project codes assigned to this user",
          status: 200
        }
      return {
        data: [],
        message: "Failed to fetch assigned project codes for this user code",
        status: 400
      }
    } catch (error) {
      this.logger.error(`Failed to fetch assigned project codes for this user \n\n ${error}`, ProjectAssigneeService.name);
      throw new HttpException('Failed to fetch assigned  project codes to this user', HttpStatus.NOT_FOUND);
    }
  }

  // find all the assignees of a company with its ID
  async findAllSubAccounts(company_id: string) {

    try {
      console.log('company_id\n', company_id)

      const data = await this.prismaService.assignee.findMany({
        where: {
          company_id
        }
      });
      if (data) {
        const returnedProject = []
        for (const item of data) {
          if (item.projectCodes[0].length < 5) {
            returnedProject.push(item)
          }
        }
        return {
          data: returnedProject,
          message: "Successfully fetch all su accounts",
          status: 200
        }
      }
      return {
        data: null,
        message: "Failed fetching subaccounts",
        status: 400
      }
    } catch (error) {
      console.log(error)
      this.logger.error(`Failed to fetch all sub accounts for this company\n\n ${error}`, ProjectAssigneeService.name)
      throw new HttpException('failed to fetch all sub accounts for this company', HttpStatus.NOT_FOUND)

    }
  }

  async getAllTheAssigneesCodesFromAListOfProjectUuidsOfACompany(projectUuids: string[], company_id: string) {

    try {

      /**
        the objective here is to get all the assignees based of their uuids
        this is to be return on each project, market, GET request.
       * 
       */

      const assignees = await this.prismaService.assignee.findMany({
        where: {
          projectCodes: {
            hasSome: projectUuids,
          },
          company_id,
        },
        select: {
          agentCode: true,
          projectCodes: true
        }
      });
      if (assignees && assignees.length)
        return {
          data: assignees,
          message: "Successfully fetch all assignees",
          status: 200
        }
      return {
        data: [],
        message: "Failed fetching agents codes based on the list of UUIDs",
        status: 400
      }
    } catch (error) {
      console.log(error)
      this.logger.error(`Failed to fetch  all sub accounts for this company\n\n ${error}`, ProjectAssigneeService.name)
      throw new HttpException('failed to fetch all sub accounts for this company', HttpStatus.NOT_FOUND)

    }
  }



  // get A single agent with its projects if any
  async findOne(id: string, company_id?: string) {

    console.log("inside projet assignee, incoming ID: ", id);  // id is the agent code in some case, in other case it is the assignee ID
    // in case the code is provide instead 
    let options = Object.create({});

    if (id.length <= 5)
      options['agentCode'] = id
    else
      options['id'] = id
    options['company_id'] = company_id;
    console.log("inside project assignee , option: ", options) //  ex. { agentCode: '982d', company_id: undefined } 
    try {
      const data = await this.prismaService.assignee.findUnique({
        where: options
      });

      console.log("inside project assignee , data: ", data)
      if (typeof data != 'undefined' && data)
        return {
          data: data?.projectCodes,
          message: "sucessfully fetched project codes assigned to this user",
          status: 201
        }
      return {
        data: [],
        message: "Failed to fetch assigned project codes for this user code",
        status: 400
      }
    } catch (error) {
      this.logger.error(`Failed to fetch assigned project codes for this user \n\n ${error}`, ProjectAssigneeService.name);
      throw new HttpException('Failed to fetch assigned  project codes to this user', HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updateProjectAssigneeDto: Prisma.AssigneeUpdateInput) {
    let options = Object.create({});
    // in case the code is provide instead
    if (id.length <= 5)
      options['agentCode'] = id
    else
      options['id'] = id


    try {
      const data = await this.prismaService.assignee.update({
        where: options,
        data: updateProjectAssigneeDto
      })
      if (typeof data != 'undefined' && data)
        return {
          data: data,
          message: "sucessfully updated project codes assigned to this user",
          status: 204
        }
      return {
        data: null,
        message: "Failed to updated assigned project codes for this user code",
        status: 400
      }
    } catch (error) {
      this.logger.error(`Failed to updated assigned project codes for this user \n\n ${error}`, ProjectAssigneeService.name);
      throw new HttpException('Failed to updated project codes to this user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(code: string) {
    try {
      const data = await this.prismaService.assignee.delete({
        where: { agentCode: code },
      })
      if (typeof data != 'undefined' && data)
        return {
          data: data,
          message: "sucessfully Deleted project codes assigned to this user",
          status: 204
        }
      return {
        data: null,
        message: "Failed to Deleted assigned project codes for this user code",
        status: 400
      }
    } catch (error) {
      this.logger.error(`Failed to Deleted assigned project codes for this user \n\n ${error}`, ProjectAssigneeService.name);
      throw new HttpException('Failed to Deleted project codes to this user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
