import { NewsResponse } from './news.response';
import { ApiProperty } from '@nestjs/swagger';

export class NewsWithComplaintsResponse extends NewsResponse {
  @ApiProperty()
  complaintsCount: number;
}
