import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  type ProductCategory,
  type ProductStatus,
} from '../product.constants.js';

export class CreateProductDto {
  @ApiProperty({ example: 'Skol Lata 350ml' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 4.5, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ enum: PRODUCT_CATEGORIES, example: 'beers' })
  @IsIn(PRODUCT_CATEGORIES)
  category: ProductCategory;

  @ApiPropertyOptional({ enum: PRODUCT_STATUSES, default: 'available' })
  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 'https://example.com/skol.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Pilsen lager, can' })
  @IsOptional()
  @IsString()
  description?: string;
}
