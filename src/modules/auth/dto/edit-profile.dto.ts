import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class EditProfileDto {
  @IsOptional()
  @IsString()
  public name?: string | undefined;

  @IsOptional()
  @IsString()
  @IsEmail()
  public email?: string | undefined;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'username can only contain alphanumeric characters',
  })
  @MinLength(5, { message: 'Username must have atleast 5 characters.' })
  public username?: string | undefined;
}
