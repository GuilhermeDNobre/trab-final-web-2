import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  type ProductCategory,
  type ProductStatus,
} from '../product.constants.js';

export const IMAGE_URL_OPTIONS = {
  protocols: ['http', 'https'],
  require_protocol: true,
  require_tld: false,
};

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimOrUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export class CreateProductDto {
  @ApiProperty({ example: 'Skol Lata 350ml', maxLength: 120 })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
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

  @ApiPropertyOptional({
    example: 'https://cdn.geanbebidas.com/products/skol.png',
    maxLength: 2048,
  })
  @Transform(trimOrUndefined)
  @IsOptional()
  @IsUrl(IMAGE_URL_OPTIONS)
  @MaxLength(2048)
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Pilsen lager, can', maxLength: 500 })
  @Transform(trimOrUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
