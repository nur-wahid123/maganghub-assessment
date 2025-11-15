import { Expose } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

export class QueryDateRangeDto {
  @IsOptional()
  @IsDateString()
  @Expose({ name: 'start_date' })
  startDate: string;

  @IsOptional()
  @IsDateString()
  @Expose({ name: 'finish_date' })
  finishDate: string;
}
