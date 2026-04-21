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
import { ParserSourceType } from './parser-source.dto';

export enum ParserSourceSortField {
  ID = 'id',
  NAME = 'name',
  TYPE = 'type',
  ACTIVE = 'active',
  LAST_PARSED_AT = 'last_parsed_at',
  NEXT_RUN_AT = 'next_run_at',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export enum ParserSortDir {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class ListSourcesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(ParserSourceType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  types?: ParserSourceType[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ParserSourceSortField)
  sortBy?: ParserSourceSortField;

  @IsOptional()
  @IsEnum(ParserSortDir)
  sortDir?: ParserSortDir;
}

export class ListParsingErrorsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsUUID()
  sourceId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
