import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNewsLocationDto {
  @ApiProperty({ description: 'The UUID of the location to add' })
  @IsUUID()
  @IsNotEmpty()
  locationId: string;
}
