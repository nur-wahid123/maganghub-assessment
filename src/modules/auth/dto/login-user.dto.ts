import { IsNotEmpty, MinLength } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty()
  @MinLength(3, { message: 'Username must have atleast 3 characters.' })
  username: string;

  @IsNotEmpty()
  password: string;
}
