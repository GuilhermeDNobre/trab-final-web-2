import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  type ProductCategory,
  type ProductStatus,
} from '../product.constants.js';

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: Number, required: true, min: 0 })
  price: number;

  @Prop({ type: String, enum: PRODUCT_CATEGORIES, required: true })
  category: ProductCategory;

  @Prop({ type: String, enum: PRODUCT_STATUSES, default: 'available' })
  status: ProductStatus;

  @Prop({ type: String, trim: true })
  imageUrl?: string;

  @Prop({ type: String, trim: true })
  description?: string;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ status: 1, category: 1 });
