import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @Expose({ name: 'old_password' })
  oldPassword: string;

  @IsNotEmpty()
  @Expose({ name: 'new_password' })
  newPassword: string;
}
