import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe.js';
import { R2StorageService, type UploadedImageFile } from '../storage/r2-storage.service.js';
import { MAX_IMAGE_SIZE_BYTES } from '../storage/storage.constants.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto.js';
import { UpdateProductStatusDto } from './dto/update-product-status.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsService } from './products.service.js';

// RN02: every route here requires a valid JWT
@ApiTags('Admin products')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
@UseGuards(JwtAuthGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly storageService: R2StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all products, including out-of-stock ones' })
  findAll(@Query() query: ListAdminProductsQueryDto) {
    return this.productsService.findAll(query, false);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get any product by id, including out-of-stock ones' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productsService.findById(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a product image to Cloudflare R2 (max 5 MB)' })
  uploadImage(@UploadedFile() file?: UploadedImageFile) {
    return this.storageService.uploadProductImage(file);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change product availability (available / out-of-stock)' })
  updateStatus(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateProductStatusDto) {
    return this.productsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productsService.remove(id);
  }
}
