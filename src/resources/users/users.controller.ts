import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserInterceptor } from './interceptors/user.interceptor';
import { Prisma, Role } from '@prisma/client';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { days, SkipThrottle, Throttle } from '@nestjs/throttler';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';
import { UserType } from './entities/user.entity';

@ApiTags('users') // enable api docs
@Controller('users')
@SkipThrottle() // avoid rate limit
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'create user' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  create(
    @Body()
    createUserDto: Partial<Prisma.UserCreateInput & { company_id: string }>,
  ) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @Roles(Role.ADG, Role.IT_SUPPORT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'get all users' })
  @ApiResponse({
    description: 'successfully fetch all users',
    status: 200,
  })
  @UseInterceptors(UserInterceptor)
  findAll(@Query() query: PaginationQueryDto) {
    const queryParams = {
      limit: Number(query.perPage || 30), // current default for pagination on admin dashboard
      skip: Number(query.page || 0),
      role: query?.role as Role | undefined,
    };
    return this.usersService.findAll({ ...queryParams });
  }

  @Get('current')
  @Roles(Role.ADG, Role.IT_SUPPORT)
  @UseGuards(RolesGuard)
  @UseInterceptors(UserInterceptor)
  @ApiOperation({ summary: 'get single user by id' })
  findOne(@CurrentUser() user: Partial<UserType>) {

    return this.usersService.findOne(<string>user?.email);
  }

  @Get(':id')
  @Roles(Role.ADG, Role.IT_SUPPORT)
  @UseGuards(RolesGuard)
  @UseInterceptors(UserInterceptor)
  @ApiOperation({ summary: 'get single user by id' })
  getOneUserById(@Param('id') id: string) {

    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADG, Role.IT_SUPPORT)
  @UseGuards(RolesGuard)
  // TODO: to be update to right value
  @Throttle({ default: { ttl: 1000, limit: 5 } })
  @ApiOperation({ summary: 'patch a user by id' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Patch(':id/punish')
  @Roles(Role.ADG, Role.IT_SUPPORT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'delete by id' })
  punishUser(
    @Param('id') id: string,
    @Query() query: { deactivate: 'INACTIVE'; ban: 'BANNED' },
  ) {
    return this.usersService.punishUser(id, query);
  }

  @Delete(':id')
  @Roles(Role.ADG, Role.IT_SUPPORT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'delete by id' })
  remove(@Param('id') id: string) {
    return this.usersService.removeUser(id);
  }
}
