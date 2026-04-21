import { IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateNewsCategoryDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
