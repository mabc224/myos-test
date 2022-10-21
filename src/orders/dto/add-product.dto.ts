import { IsInt, IsPositive } from 'class-validator';

export class AddProductDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}
