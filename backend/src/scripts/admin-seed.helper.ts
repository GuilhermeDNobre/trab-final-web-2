import type { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Admin, type AdminDocument } from '../admins/admin.schema.js';
import { Product } from '../products/schemas/product.schema.js';

export async function syncIndexesAndSeedAdmin(app: INestApplicationContext): Promise<void> {
  const config = app.get(ConfigService);
  const adminModel = app.get<Model<Admin>>(getModelToken(Admin.name), { strict: false });
  const productModel = app.get<Model<Product>>(getModelToken(Product.name), { strict: false });

  const email = config.get<string>('ADMIN_EMAIL');
  const password = config.get<string>('ADMIN_PASSWORD');
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment');
  }

  // Creates the collections and the indexes declared in the schemas
  await Promise.all([adminModel.syncIndexes(), productModel.syncIndexes()]);
  console.log('Indexes synchronized');

  const normalizedEmail = email.trim().toLowerCase();
  const existing: AdminDocument | null = await adminModel
    .findOne({ email: normalizedEmail })
    .select('+password');

  if (existing) {
    existing.password = password;
    await existing.save();
    console.log(`Admin updated: ${normalizedEmail}`);
  } else {
    await adminModel.create({ email: normalizedEmail, password });
    console.log(`Admin created: ${normalizedEmail}`);
  }
}
