import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  IsInt,
  IsPositive,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsUrl(undefined, { message: 'Picture URL is not valid.' })
  @IsOptional()
  picture?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price may be max 2 decimal long' },
  )
  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number;
}
