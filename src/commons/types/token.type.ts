import { RoleEnum } from '../enums/role.enum';

export type Token = {
  access_token: string;
  role: RoleEnum;
};
