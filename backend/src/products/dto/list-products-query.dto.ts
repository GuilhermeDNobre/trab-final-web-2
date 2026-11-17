import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PRODUCT_CATEGORIES, type ProductCategory } from '../product.constants.js';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class ListProductsQueryDto {
  @ApiPropertyOptional({ enum: PRODUCT_CATEGORIES })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(PRODUCT_CATEGORIES)
  category?: ProductCategory;

  @ApiPropertyOptional({ description: 'Case-insensitive search by product name', example: 'skol' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  search?: string;
}
