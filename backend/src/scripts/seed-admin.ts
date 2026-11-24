import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { syncIndexesAndSeedAdmin } from './admin-seed.helper.js';

async function seedAdmin(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  try {
    await syncIndexesAndSeedAdmin(app);
  } finally {
    await app.close();
  }
}

seedAdmin().catch((error) => {
  console.error('Admin seed failed:', error);
  process.exit(1);
});
