import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import type { ProductStatus } from './product.constants.js';
import { Product } from './schemas/product.schema.js';

const ACCENT_GROUPS: Record<string, string> = {
  a: '[aáàâãäÁÀÂÃÄ]',
  e: '[eéèêëÉÈÊË]',
  i: '[iíìîïÍÌÎÏ]',
  o: '[oóòôõöÓÒÔÕÖ]',
  u: '[uúùûüÚÙÛÜ]',
  c: '[cçÇ]',
  n: '[nñÑ]',
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildSearchRegex(value: string): string {
  const normalized = value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  return escapeRegex(normalized).replace(
    /[aeiounc]/gi,
    (char) => ACCENT_GROUPS[char.toLowerCase()] ?? char,
  );
}

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

  // onlyAvailable = true is the storefront view (RN01)
  findAll(query: ListAdminProductsQueryDto, onlyAvailable: boolean) {
    const filter: Record<string, unknown> = {};

    if (onlyAvailable) {
      filter.status = 'available';
    } else if (query.status) {
      filter.status = query.status;
    }
    if (query.category) {
      filter.category = query.category;
    }
    if (query.search?.trim()) {
      filter.name = { $regex: buildSearchRegex(query.search), $options: 'i' };
    }

    return this.productModel.find(filter).sort({ name: 1 });
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
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
    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (value === undefined) continue;
      if (value === null) {
        $unset[key] = 1;
      } else {
        $set[key] = value;
      }
    }

    const updateDoc: Record<string, unknown> = {};
    if (Object.keys($set).length > 0) {
      updateDoc.$set = $set;
    }
    if (Object.keys($unset).length > 0) {
      updateDoc.$unset = $unset;
    }

    const product = await this.productModel.findByIdAndUpdate(id, updateDoc, {
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
