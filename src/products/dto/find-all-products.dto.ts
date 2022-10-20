import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsIn,
} from 'class-validator';

export class FindAllProductsDto {
  @IsString()
  @IsOptional()
  @IsIn(['title', 'description'])
  searchBy: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  search: string;

  @IsString()
  @IsOptional()
  @IsIn(['price'])
  sortBy?: string;

  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: string;
}
