import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';
import { PRODUCT_STATUSES, type ProductStatus } from '../product.constants.js';
import { emptyToUndefined, ListProductsQueryDto } from './list-products-query.dto.js';

export class ListAdminProductsQueryDto extends ListProductsQueryDto {
  @ApiPropertyOptional({ enum: PRODUCT_STATUSES })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;
}
