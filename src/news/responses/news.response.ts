import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NewsCategoryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class LocationResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  lemma: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  originalText: string;

  @ApiProperty()
  lat: number;

  @ApiProperty()
  lon: number;
}

export class NewsResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  link: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  imageUrl: string | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  publishedAt: Date | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  sentimentScore: number | null;

  @ApiProperty()
  sourceId: string;

  @ApiProperty()
  categoryId: string;

  @ApiPropertyOptional({ type: NewsCategoryResponse })
  category?: NewsCategoryResponse;

  @ApiPropertyOptional({ type: [LocationResponse] })
  locations?: LocationResponse[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
