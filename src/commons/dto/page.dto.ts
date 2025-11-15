import { IsArray } from 'class-validator';
import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  @IsArray()
  data: T[];
  pagination: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.pagination = meta;
  }
}
