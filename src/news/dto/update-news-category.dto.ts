import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNewsCategoryDto {
  @ApiProperty({ description: 'The UUID of the new category' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
