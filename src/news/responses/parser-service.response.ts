import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParserSourceType } from '../dto/parser-source.dto';

export class ParserSourceResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ enum: ParserSourceType })
  type: ParserSourceType;

  @ApiProperty()
  active: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  schedule: string | null;

  @ApiProperty()
  configuration: Record<string, any>;

  @ApiPropertyOptional({ type: String, nullable: true })
  lastParsedAt: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nextRunAt: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class ParserSourceSummaryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ enum: ParserSourceType })
  type: ParserSourceType;

  @ApiProperty()
  active: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  schedule: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  lastParsedAt: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nextRunAt: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class ParserParsingErrorResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sourceId: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  errorMessage: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  createdAt: string | null;
}
