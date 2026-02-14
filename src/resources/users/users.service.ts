import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, Role, User, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { LoggerService } from 'src/global/logger/logger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';


@Injectable()
export class UsersService {
  private readonly logger = new LoggerService(UsersService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) { }

  async findOne(id: string) {


    try {
      const where = {} as {
        id: string | undefined;
        email: string | undefined;
      };
      if (id.toString().includes('@')) {
        where['email'] = id as string;
      } else where['id'] = id as string;

      const user = await this.prismaService.user.findUnique({
        where,
        include: {
          company: {
            select: {
              name: true,
              id: true,
              payment_id: true,
              logo: true,
              email: true,
            },
          },
        },
      });

      if (user)
        return {
          data: user,
          status: HttpStatus.OK,
          message: `User fetched  successfully`,
        };
      else
        return {
          data: null,
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to fetch user`,
        };
    } catch (error) {
      this.logger.error(
        `Error fetching user  \n\n: ${error}`,
        UsersService.name,
      );
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }
  async findAndBuildUserWithTokenSub(tokenPayload: { user_first_name: string, user_email: string, sub: string, org_role: string }) {
    const existingUser = <User>await this.prismaService.user.findUnique({
      where: { id: tokenPayload.sub },
      select: {
        role: true,
        id: true,
        email: true,
        company_id: true,
        first_name: true,
      },
    });

    let userRole: Role = Role.ADG;
    if (tokenPayload.org_role) userRole = Role.PDG;

    if (!existingUser?.company_id)
      throw new Error('The user don\'t have a company')

    const user: Partial<User> = {
      id: existingUser?.id ?? tokenPayload.sub,
      email: existingUser?.email ?? tokenPayload.user_email,
      first_name: existingUser?.first_name ?? tokenPayload.user_first_name,
      role: existingUser?.role ?? userRole,
      company_id: existingUser?.company_id,
    };

    return user;
  }

  async findAll({ page, perPage, role }: Partial<PaginationQueryDto>) {
    // 👷‍♂️ needed the total count for pagination but prisma has no inbuilt count option. Running an atomic operation like a transaction is a way around
    try {
      const where: { role: Role | undefined } = {
        role: undefined,
      };
      if (role) {
        where['role'] = role;
      }

      const query: {
        where: typeof where;
        take?: number;
        skip?: number;
        orderBy?: Prisma.UserOrderByWithRelationInput & {
          createdAt: 'desc' | 'asc';
        };
      } = { where };
      if (perPage) {
        query['take'] = perPage;
        query['skip'] = (page ?? 0) * (perPage - 1);
      }
      // query["orderBy"] = {
      //   created_at: "desc",
      // }
      const [total, users] = await this.prismaService.$transaction([
        this.prismaService.user.count({ where }),
        this.prismaService.user.findMany(query),
      ]);
      if (users.length)
        return {
          status: 200,
          message: 'users fetched successfully',
          data: users,
          total,
          page: page ?? 0,
          perPage: perPage ?? 20 - 1,
          totalPages: Math.ceil(total / (perPage ?? 20)),
        };
      else
        return {
          status: 400,
          message: 'No users found',
          data: [],
          total,
          page: page ?? 0,
          perPage: perPage ?? 20 - 1,
          totalPages: Math.ceil(total / (perPage ?? 20)),
        };
    } catch (error) {
      this.logger.error(
        `Error fetching users \n\n: ${error}`,
        UsersService.name,
      );
      throw new NotFoundException('No users found');
    }
  }

  //TODO: use the right Type here insted of any
  async createUserFromCompany(data: {
    id: string;
    first_name: string;
    email: string;
    role: string;
    company_id?: string;
  }) {
    try {
      // check first if the user already exist before creating newuser

      const user = await this.prismaService.user.findUnique({
        where: {
          email: data.email as string,
        },
      });

      if (user)
        return user;
      else {
        const user = await this.prismaService.user.create({
          data: {
            id: data.id,
            first_name: <string>data.first_name,
            email: data.email,
            role: <Role>data.role,
            status: UserStatus.ACTIVE,
            company_id: <string>data.company_id,
          },
        });
        return user;
      }
    } catch (error) {
      this.logger.error(
        `error creating the user ${data.first_name} \n\n: ${error}`,
        UsersService.name,
      );
      throw new InternalServerErrorException(
        'Failed to create user' + data.first_name,
      );
    }
  }

  async createUser(
    data: Partial<Prisma.UserCreateInput & { company_id: string }>,
  ) {
    try {
      // check first if the user already exist before creating newuser

      const user = await this.prismaService.user.findUnique({
        where: {
          email: <string>data.email,
        },
      });

      if (user?.id)
        return {
          status: 409,
          message: 'User with this email already exists',
          data: user,
        };
      else {
        const newUSer = await this.prismaService.user.create({
          data: {
            // id: data.id,
            first_name: <string>data.first_name,
            email: data.email,
            role: data.role,
            company_id: <string>data.company_id,
            status: UserStatus.ACTIVE,
            phone_number: data.phone_number ?? null,
            username: data.username ?? null,
            famer_attached_contract_url:
              data.famer_attached_contract_url ?? null,
            last_name: data.last_name ?? null,
            profileUrls: data.profileUrls ?? null,
          },
        });

        if (newUSer && newUSer.id) {
          return {
            status: 201,
            message: 'User created successfully',
            data: newUSer,
          };
        } else {
          return {
            status: 404,
            message: 'User not found',
            data: null,
          };
        }
      }
    } catch (error) {
      this.logger.error(
        `error creating the user ${data.first_name} \n\n: ${error}`,
        UsersService.name,
      );
      throw new InternalServerErrorException(
        'Failed to create user' + data.first_name,
      );
    }
  }

  async updateUser(id: string, update: Partial<CreateUserDto>) {
    try {
      const user = await this.prismaService.user
        .update({
          where: {
            id: id,
          },
          data: {
            ...update,
          },
        })
        .catch((error) => {
          this.logger.error(
            `Error updating user  \n\n: ${error}`,
            UsersService.name,
          );
          throw new InternalServerErrorException('Failed to update user');
        });

      if (typeof user != 'undefined' && user) {
        // set the new user the request
        this.eventEmitter.emit('user.created', user);
        return {
          data: user,
          status: 204,
          message: `User updated successfully`,
        };
      }

      else
        return {
          data: null,
          status: 500,
          message: `Failed to update user`,
        };
    } catch (error) {
      this.logger.error(
        `Error updating user  \n\n: ${error}`,
        UsersService.name,
      );
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async updatedRole(id: string, role: Role) {
    return this.updateUser(id, { role });
  }

  async punishUser(
    id: string,
    query: { deactivate: 'INACTIVE'; ban: 'BANNED' },
  ) {
    try {
      const deletedUser = await this.prismaService.user.update({
        where: {
          id: id,
        },
        data: {
          status: query.deactivate
            ? UserStatus.INACTIVE
            : query.ban
              ? UserStatus.BANNED
              : UserStatus.ACTIVE,
        },
      });

      if (deletedUser) {
        // set the new user the request
        this.eventEmitter.emit('user.updated', deletedUser);
        return {
          data: deletedUser,
          status: 204,
          message: `User ${query.deactivate ? 'deactivated' : query.ban ? 'banned' : 'reactivated'} successfully`,
        };
      }

      else
        return {
          data: null,
          status: 500,
          message: `Failed to delete user`,
        };
    } catch (error) {
      this.logger.error(
        `Error  ${query.deactivate ? 'deactivated' : query.ban ? 'banned' : 'reactivated'}  user  \n\n: ${error}`,
        UsersService.name,
      );
      throw new InternalServerErrorException(
        `Failed to  ${query.deactivate ? 'deactivated' : query.ban ? 'banned' : 'reactivated'}  user`,
      );
    }
  }

  async removeUser(id: string) {
    try {
      const deletedUser = await this.prismaService.user.delete({
        where: {
          id: id,
        },
      });

      if (deletedUser)
        return {
          data: '',
          status: 204,
          message: `User deleted successfully`,
        };
      else
        return {
          data: null,
          status: 500,
          message: `Failed to delete user`,
        };
    } catch (error) {
      this.logger.error(
        `Error removing user  \n\n: ${error}`,
        UsersService.name,
      );
      throw new InternalServerErrorException('Failed to removing user');
    }
  }
}
