import { SetMetadata } from '@nestjs/common';

import { CompanyStatus, Role } from '@prisma/client';

// get the current logged in user role.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// get the status of the current logged in company.
export const CurrentCompanyStatus = (...status: CompanyStatus[]) => SetMetadata('CompanyStatus', status);
