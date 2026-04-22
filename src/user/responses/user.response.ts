import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NewsCategoryResponse,
  LocationResponse,
} from '../../news/responses/news.response';

export class UserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  googleId: string | null;

  @ApiProperty()
  hasPassword: boolean;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiPropertyOptional({ type: [NewsCategoryResponse] })
  preferredCategories?: NewsCategoryResponse[];

  @ApiPropertyOptional({ type: [LocationResponse] })
  preferredLocations?: LocationResponse[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
