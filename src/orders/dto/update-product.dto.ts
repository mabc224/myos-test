import { OmitType } from '@nestjs/mapped-types';
import { AddProductDto } from './add-product.dto';

export class UpdateProductDto extends OmitType(AddProductDto, [
  'productId',
] as const) {}
