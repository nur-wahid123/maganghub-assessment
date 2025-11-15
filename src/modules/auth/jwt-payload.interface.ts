import { RoleEnum } from 'src/commons/enums/role.enum';

export interface JwtPayload {
  username: string;
  sub: number;
  role: RoleEnum;
  email: string;
  image?: number;
}
