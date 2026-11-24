import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { AppModule } from '../app.module.js';
import { Product } from '../products/schemas/product.schema.js';
import { syncIndexesAndSeedAdmin } from './admin-seed.helper.js';

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
    await syncIndexesAndSeedAdmin(app);

    const productModel = app.get<Model<Product>>(getModelToken(Product.name), { strict: false });
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
