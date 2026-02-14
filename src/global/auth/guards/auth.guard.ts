import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from './roles.decorator';
import { CompanyStatus, Role } from '@prisma/client';
import { LoggerService } from 'src/global/logger/logger.service';
import { PrismaService } from 'src/adapters/config/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prismaService: PrismaService) { }
  private readonly logger = new LoggerService(RolesGuard.name);
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    if (request.originalUrl.includes("/v1/companies") && request.method === "POST") {
      return true
    }

    console.log("\n\n request url: ", request?.originalUrl);

    // we make sure the user is connected and authenticated
    const { user } = context.switchToHttp().getRequest();

    // block every resource mutation for non subscribed companies
    // if (request.method === "POST" || request.method === "PATCH" || request.method === "DELETE") {
    //   const companyStatus = this.getCompanyStatus(user.company_id)
    //     .then((response) => {
    //       if (response?.status === CompanyStatus.INACTIVE) {
    //         this.logger.error(
    //           'user not allowed access to route handler: company not subscribed',
    //           RolesGuard.name,
    //         );
    //         return false;
    //       }
    //     })
    // }

    // allow route access for public routes like : health check etc.
    if (!requiredRoles && !user) {
      this.logger.log('user allowed access to route handler', RolesGuard.name);
      return true;
    }
    if (!(requiredRoles && user)) {
      !user
        ? this.logger.error('user not authenticated', RolesGuard.name)
        : this.logger.error(
          'user not allowed to access the route handler: no role attached',
          RolesGuard.name,
        );
      return false;
    }
    this.logger.log('user allowed access to route handler', RolesGuard.name);
    // we make sure the user has the right permissions concerning the handler target.
    return requiredRoles.includes(user.role);
  }

  // get the current company status to check its permissions
  async getCompanyStatus(company_id: string) {
    return await this.prismaService.company.findUnique({ where: { id: company_id }, select: { status: true } });
  }
}
