import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { AdminDocument, Admin } from '../admins/admin.schema.js';
import { AppModule } from '../app.module.js';
import { Product } from '../products/schemas/product.schema.js';

const sampleProducts = [
  { name: 'Skol Lata 350ml', price: 4.5, category: 'beers', description: 'Pilsen lager, can' },
  { name: 'Heineken Long Neck 330ml', price: 8.9, category: 'beers', description: 'Premium lager' },
  { name: 'Brahma Duplo Malte 600ml', price: 9.5, category: 'beers', status: 'out-of-stock' },
  { name: 'Vodka Smirnoff 998ml', price: 42.9, category: 'spirits', description: 'Classic vodka' },
  { name: 'Whisky Red Label 1L', price: 89.9, category: 'spirits', status: 'out-of-stock' },
  { name: 'Coca-Cola 2L', price: 11, category: 'soft-drinks', description: 'Original flavor' },
  { name: 'Guaraná Antarctica Lata 350ml', price: 4.2, category: 'soft-drinks' },
  { name: 'Amendoim Japonês 200g', price: 7.5, category: 'snacks', description: 'Crunchy peanuts' },
  { name: 'Batata Ruffles 96g', price: 9.9, category: 'snacks', status: 'out-of-stock' },
  { name: 'Gelo em Cubos 5kg', price: 12, category: 'ice', description: 'Ice cubes bag' },
];

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  try {
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

    await productModel.deleteMany({});
    const created = await productModel.insertMany(sampleProducts);
    console.log(`Products inserted: ${created.length}`);
  } finally {
    await app.close();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
