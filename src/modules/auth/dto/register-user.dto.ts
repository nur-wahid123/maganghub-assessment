import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/commons/enums/role.enum';

export class UserRegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Username must have atleast 5 characters.' })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'username can only contain alphanumeric characters',
  })
  public username?: string;

  @IsNotEmpty()
  @IsString()
  public name?: string;

  @IsNotEmpty()
  @IsString()
  public email?: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  })
  public password?: string;

  @IsNotEmpty()
  @IsString()
  @Expose({ name: 'confirm_password' })
  public confirmPassword?: string;

  @IsOptional()
  @IsEnum(RoleEnum)
  public role?: RoleEnum = RoleEnum.USER;
}
