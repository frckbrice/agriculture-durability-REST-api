// import {
//   HttpStatus,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { PrismaService } from 'src/adapters/config/prisma.service';
// import { Prisma, } from '@prisma/client';
// import { LoggerService } from 'src/global/logger/logger.service';
// import { EventEmitter2 } from '@nestjs/event-emitter';

// @Injectable()
// export class ProjectInvitationService {
//   private readonly logger = new LoggerService(ProjectInvitationService.name);

//   constructor(
//     private readonly prismaService: PrismaService,
//     private readonly eventEmitter: EventEmitter2
//   ) { }


//   async createInvitation({
//     invitation_emails, manager_id,
//   }: {
//     invitation_emails: string[];
//     manager_id: string;
//   }) {

//     try {
//       invitation_emails.forEach(async (email) => {
//         const invites = await this.prismaService.project_audit.create({
//           data: {

//           }
//         })
//       })
//     } catch (error) {
//       this.logger.error(
//         `Error while creating project ${error}`,
//         ProjectInvitationService.name,
//       );
//       throw new InternalServerErrorException(`Error while creating project`);
//     }
//   }

//   async findAll(company_id: string) {

//     // find all the project with the latest start date with its status and type
//     try {

//     } catch (error) {
//       this.logger.error('Error fetching projects', ProjectInvitationService.name);
//       throw new NotFoundException('Error fetching projects');
//     }
//   }

//   async findOne(project_id: string) {


//     try {

//     } catch (err) {
//       this.logger.error(
//         `Can't find a project with project_id ${project_id} \n\n ${err}`,
//         ProjectInvitationService.name,
//       );
//       throw new NotFoundException(
//         "Can't find a project with project_id " + project_id,
//       );
//     }
//   }

//   async update({
//     id,
//     user_id,
//     updateProjectDto,
//   }: {
//     id: string;
//     user_id: string;
//     updateProjectDto: Prisma.ProjectUpdateInput;
//   }) {


//     try {

//     } catch (err) {
//       this.logger.error(
//         `Can't update a project with id  ${id} \n\n ${err}`,
//         ProjectInvitationService.name,
//       );
//       throw new InternalServerErrorException(
//         "Can't update a project with id " + id,
//       );
//     }
//   }
//   // update many projects
//   async updateMany(projectIds: string[], updateProjectDto: Prisma.ProjectUpdateInput, user_id: string) {

//     try {

//     } catch (error) {
//       this.logger.error(
//         `Can't archieve a project list \n\n ${error}`,
//         ProjectInvitationService.name,
//       );
//       throw new InternalServerErrorException(
//         "Can't update a project list ",
//       );
//     }
//   }

//   // update a single project
//   async remove({ project_id, user_id }: { project_id: string, user_id: string }) {
//     try {

//     } catch (err) {
//       this.logger.error(
//         "Can't delete a project with project_id " + project_id + '\n\n ' + err,
//         ProjectInvitationService.name,
//       );
//       throw new InternalServerErrorException(
//         "Can't delete a project with project_id " + project_id,
//       );
//     }
//   }

//   async deleteManyByIds(ids: string[], user_id: string) {
//     try {

//     } catch (error) {
//       this.logger.error(
//         "Can't delete a project list with project_ids " + '\n\n ' + error,
//         ProjectInvitationService.name,
//       );
//       throw new InternalServerErrorException(
//         "Can't delete a project list with project_ids ",
//       );
//     }
//   }



// }
