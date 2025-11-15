import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/commons/enums/role.enum';

export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'username can only contain alphanumeric characters',
  })
  @MinLength(5, { message: 'Username must have atleast 5 characters.' })
  username: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  })
  password: string;

  @IsEnum(RoleEnum)
  role: RoleEnum;
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
