import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ListNearbyNewsQueryDto {
  @ApiProperty({ example: 50.4501 })
  @Type(() => Number)
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 30.5234 })
  @Type(() => Number)
  @IsNumber()
  lon: number;

  @ApiProperty({ description: 'Distance in kilometers', example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dist: number;

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

  @ApiPropertyOptional({ description: 'Search in title or description' })
  @IsOptional()
  @IsString()
  search?: string;
}
