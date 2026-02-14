import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProjectAssigneeService } from './project-assignee.service';
import { UpdateProjectAssigneeDto } from './dto/update-project-assignee.dto';
import { Prisma, Role, User } from '@prisma/client';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';


@Controller('project_assignee')
@ApiTags('project_assignee')
export class ProjectAssigneeController {
  constructor(private readonly projectAssigneeService: ProjectAssigneeService) { }

  @Post()
  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  create(@Body() createProjectAssigneeDto: Prisma.AssigneeCreateInput) {
    return this.projectAssigneeService.create(createProjectAssigneeDto);
  }

  // assigne to multiple agents one or more projects. Bulk create
  @Post('bulkCreate')
  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  bulkCreate(@Body() createProjectAssigneeDto: Prisma.AssigneeCreateInput[]) {
    return this.projectAssigneeService.bulkCreate(createProjectAssigneeDto);
  }

  @Get()
  @Roles(Role.ADG, Role.AUDITOR)
  @UseGuards(RolesGuard)
  findAll(@Query() query: { agentCode: string },
    @CurrentUser() user: Partial<User>
  ) {
    return this.projectAssigneeService.findAll(<string>user?.company_id, query.agentCode,);
  }

  // GET ALL SUBACCOUNTS OF A COMPANY
  @Get('perCompany')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AUDITOR, Role.IT_SUPPORT)
  findAllSubAccounts(@Query() query: { company_id: string }) {
    console.log('company_id from controler\n', query)
    return this.projectAssigneeService.findAllSubAccounts(query.company_id)
  }

  @Get('projects_per_code')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AUDITOR, Role.IT_SUPPORT)
  getProjectsAssignedToAgent(
    @Query() query: { agentCode: string },
    @CurrentUser() user: User,
  ) {
    console.log('company_id from controler\n', query)
    return this.projectAssigneeService.getAllProjectSAssignedToAgent({ code: query.agentCode, company_id: <string>user?.company_id })
  }

  @Get(':id')
  @Roles(Role.ADG, Role.AUDITOR)
  @UseGuards(RolesGuard)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: Partial<User>
  ) {
    return this.projectAssigneeService.findOne(id, <string>user?.company_id);
  }

  @Patch(':id')
  @Roles(Role.ADG,)
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateProjectAssigneeDto: UpdateProjectAssigneeDto) {
    return this.projectAssigneeService.update(id, updateProjectAssigneeDto);
  }

  @Delete(':id')
  @Roles(Role.ADG,)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.projectAssigneeService.remove(id);
  }
}
