import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import type { ProductStatus } from './product.constants.js';
import { Product } from './schemas/product.schema.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

  // onlyAvailable = true is the storefront view (RN01)
  findAll(query: ListProductsQueryDto, onlyAvailable: boolean) {
    const filter: Record<string, unknown> = {};

    if (onlyAvailable) {
      filter.status = 'available';
    }
    if (query.category) {
      filter.category = query.category;
    }
    if (query.search?.trim()) {
      filter.name = { $regex: escapeRegex(query.search.trim()), $options: 'i' };
    }

    return this.productModel.find(filter).sort({ name: 1 });
  }

  async findAvailableById(id: string) {
    const product = await this.productModel.findOne({ _id: id, status: 'available' });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  create(dto: CreateProductDto) {
    return this.productModel.create(dto);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productModel.findByIdAndUpdate(id, dto, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateStatus(id: string, status: ProductStatus) {
    return this.update(id, { status });
  }

  async remove(id: string): Promise<void> {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }
}
