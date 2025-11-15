import { UserEntity } from 'src/entities/user.entity';

export class ExportViolationResponseDto {
  public user: UserEntity | null;

  public date: Date | null;
}
