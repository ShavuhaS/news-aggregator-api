import { IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateNewsLocationDto {
  @IsUUID()
  @IsNotEmpty()
  locationId: string;
}
