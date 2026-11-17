import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { PRODUCT_STATUSES, type ProductStatus } from '../product.constants.js';

export class UpdateProductStatusDto {
  @ApiProperty({ enum: PRODUCT_STATUSES, example: 'out-of-stock' })
  @IsIn(PRODUCT_STATUSES)
  status: ProductStatus;
}
