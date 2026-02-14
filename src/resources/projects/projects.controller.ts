import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from 'src/global/logger/logger.service';
import { Prisma, Role, User } from '@prisma/client';
import { PaginationProjectQueryDto } from './dto/paginate-project.dto';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';

// to handle rate limiting
import { SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';
import { query } from 'express';

@ApiTags('projects')
@UseGuards(RolesGuard)
@SkipThrottle()
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }
  private readonly logger = new LoggerService(ProjectsController.name);

  @Post()
  @ApiOperation({
    summary: 'create project'
  })
  @ApiResponse({
    status: 201,
    description: 'The projects has been successfully created.',
  })
  @Roles(Role.ADG, Role.IT_SUPPORT)
  create(
    @Body() createProjectDto: Prisma.ProjectCreateInput,
    @CurrentUser() user: Partial<User>,
  ) {

    console.log("project controller current user: ", user);
    return this.projectsService.create({
      createProjectDto,
      company_id: <string>user.company_id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Find all projects' })
  @ApiResponse({
    status: 200,
    description: 'The projects has been successfully fetched.',
  })
  @Roles(Role.ADG, Role.IT_SUPPORT, Role.AUDITOR)
  findAll(
    @Query() query: PaginationProjectQueryDto & { agentCode: string },
    @CurrentUser() user: Partial<User>) {

    console.log("current user: ", user)
    return this.projectsService.findAll(query, <string>user.company_id);
  }
  // get all projects codes of a company
  @Get('company_projectCode')
  @ApiOperation({ summary: 'Find all projects codes of a company ' })
  @ApiResponse({
    status: 200,
    description: 'The projects has been successfully fetched.',
  })
  @Roles(Role.ADG, Role.IT_SUPPORT, Role.AUDITOR)
  getAllCompanyProjectCodes(@Query() query: PaginationProjectQueryDto, @CurrentUser() user: Partial<User>) {
    return this.projectsService.findAllProjectCodesOfCompany(query, <string>user.company_id)
  }

  @Get('assigned_projects')
  @ApiOperation({ summary: 'Find all projects ' })
  @ApiResponse({
    status: 200,
    description: 'The projects has been successfully fetched.',
  })
  @Roles(Role.ADG, Role.IT_SUPPORT, Role.AUDITOR)
  findAllAssignedProjects(@Query() query: { agentCode: string }) {

    console.log("get all assigned projects by this code: ", query.agentCode)
    return this.projectsService.getAllAssignedProjects(query.agentCode);
  }

  @Get(':project_id')
  @ApiOperation({ summary: 'find one project with its Id' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully fetched.',
  })
  @Roles(Role.ADG, Role.IT_SUPPORT, Role.AUDITOR)
  findOne(@Param('project_id') project_id: string) {
    return this.projectsService.findOne(project_id);
  }

  @Patch(':project_id')
  @ApiOperation({ summary: 'update one project with its Project_id' })
  @ApiResponse({
    status: 200, // returned as this resource is again used in front end
    description: 'The project has been successfully updated.',
  })
  @Roles(Role.ADG, Role.IT_SUPPORT)
  @ApiOperation({ summary: 'update one project with its Project_id' })
  update(
    @Param('project_id') project_id: string,
    @Body() updateProjectDto: Prisma.ProjectUpdateInput,
    @CurrentUser() user: Partial<User>,
  ) {
    return this.projectsService.update({
      id: project_id,
      user_id: <string>user.id,
      updateProjectDto,
    });
  }

  @Delete(':project_id')
  @ApiOperation({ summary: 'delete one project with its Project_id' })
  @ApiResponse({
    status: 204, // returned as this resource is no more used in front end
    description: 'The project has been successfully deleted.',
  })
  @Roles(Role.ADG, Role.IT_SUPPORT)
  @ApiOperation({ summary: 'delete one project with its Project_id' })
  remove(@Param('project_id') project_id: string, @CurrentUser() user: Partial<User>,) {

    console.log("deleting project: " + project_id);
    return this.projectsService.remove(project_id, <string>user.id);
  }

  // delete multiple projects
  @Delete('delete-many')
  async deleteMany(@Body() ids: string[], @CurrentUser() user: Partial<User>) {
    return this.projectsService.deleteManyByIds(ids, <string>user.id);
  }

  // update multiple projects
  @Patch('update-many')
  async updateMany(
    @Body() data: Prisma.ProjectUpdateInput & { ids: string[] },
    @CurrentUser() user: Partial<User>) {
    return this.projectsService.updateMany(data.ids, data, <string>user.id);
  }
}
