import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ParserSourceType {
  RSS = 'RSS',
  JSON = 'JSON',
  HTML = 'HTML',
}

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

export class CreateSourceDto {
  @ApiProperty({ example: 'CNN' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'http://rss.cnn.com/rss/edition.rss' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ enum: ParserSourceType })
  @IsEnum(ParserSourceType)
  @IsNotEmpty()
  type: ParserSourceType;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({
    example: '0 */1 * * *',
    description: 'Cron expression',
  })
  @IsString()
  @IsOptional()
  schedule?: string;

  @ApiPropertyOptional({ example: {} })
  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}

export class UpdateSourceBasicDto {
  @ApiPropertyOptional({ example: 'Updated CNN' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'http://rss.cnn.com/rss/edition_new.rss' })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ example: '0 */2 * * *' })
  @IsString()
  @IsOptional()
  schedule?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo_new.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}

export class UpdateSourceStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  active: boolean;
}

export class UpdateSourceConfigDto {
  @ApiProperty({ example: { someSetting: 'value' } })
  @IsObject()
  @IsNotEmpty()
  configuration: Record<string, any>;
}
