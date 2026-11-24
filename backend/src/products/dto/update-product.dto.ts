import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';
import { CreateProductDto, IMAGE_URL_OPTIONS } from './create-product.dto.js';

const trimOrNullIfEmpty = ({ value }: { value: unknown }) => {
  if (value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['imageUrl', 'description'] as const),
) {
  @ApiPropertyOptional({
    example: 'https://cdn.geanbebidas.com/products/skol.png',
    nullable: true,
    maxLength: 2048,
    description: 'Send null or an empty string to remove the current image',
  })
  @Transform(trimOrNullIfEmpty)
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsUrl(IMAGE_URL_OPTIONS)
  @MaxLength(2048)
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'Pilsen lager, can',
    nullable: true,
    maxLength: 500,
    description: 'Send null or an empty string to remove the current description',
  })
  @Transform(trimOrNullIfEmpty)
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(500)
  description?: string | null;
}
