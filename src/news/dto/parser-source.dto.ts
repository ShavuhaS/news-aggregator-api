import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export enum ParserSourceType {
  RSS = 'RSS',
  JSON = 'JSON',
  HTML = 'HTML',
}

export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsEnum(ParserSourceType)
  @IsNotEmpty()
  type: ParserSourceType;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}

export class UpdateSourceBasicDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}

export class UpdateSourceStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  active: boolean;
}

export class UpdateSourceConfigDto {
  @IsObject()
  @IsNotEmpty()
  configuration: Record<string, any>;
}
