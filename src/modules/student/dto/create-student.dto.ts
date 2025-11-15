import { Expose, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  public name?: string;

  @IsNotEmpty()
  @IsString()
  public nisn?: string;

  @IsNotEmpty()
  @IsString()
  public nis?: string;

  @IsNotEmpty()
  @IsString()
  @Expose({ name: 'class_name' })
  public className?: string;
}

export class CreateStudentBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  public items?: CreateStudentDto[];
}
