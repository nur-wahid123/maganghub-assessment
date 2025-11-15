import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enums/role.enum';

export const SetRole = (...roles: RoleEnum[]) =>
  SetMetadata('roles', roles.length > 1 ? roles : [roles[0]]);
