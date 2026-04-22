import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsBoolean,
  IsString,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ParserSourceType,
  ParserSourceSortField,
  ParserSortDir,
} from './parser-source.dto';

export class ListSourcesQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ enum: ParserSourceType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ParserSourceType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  types?: ParserSourceType[];

  @ApiPropertyOptional({ description: 'Search in source name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ParserSourceSortField })
  @IsOptional()
  @IsEnum(ParserSourceSortField)
  sortBy?: ParserSourceSortField;

  @ApiPropertyOptional({ enum: ParserSortDir })
  @IsOptional()
  @IsEnum(ParserSortDir)
  sortDir?: ParserSortDir;
}

export class ListParsingErrorsQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sourceId?: string;

  @ApiPropertyOptional({ example: '2026-04-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-04-30T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
