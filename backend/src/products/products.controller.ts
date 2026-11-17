import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { ProductsService } from './products.service.js';

// Public storefront: only products with status "available" (RN01)
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List available products, optionally filtered by category and name' })
  findAll(@Query() query: ListProductsQueryDto) {
    return this.productsService.findAll(query, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an available product by id' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productsService.findAvailableById(id);
  }
}
