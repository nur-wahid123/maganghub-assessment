import { Expose } from 'class-transformer';
import { PageMetaDtoParameters } from '../types/page-meta-dto-parameters.type';
export class PageMetaDto {
  page: number;

  take: number;

  @Expose({ name: 'item_count' })
  itemCount: number;

  @Expose({ name: 'page_count' })
  pageCount: number;

  @Expose({ name: 'has_previous_page' })
  hasPreviousPage: boolean;

  @Expose({ name: 'has_next_page' })
  hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
