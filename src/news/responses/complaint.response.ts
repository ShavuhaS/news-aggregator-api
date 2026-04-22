import { ComplaintStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ComplaintResponse {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  newsId: string | null;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  reason: string;

  @ApiProperty({ enum: ComplaintStatus })
  status: ComplaintStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
