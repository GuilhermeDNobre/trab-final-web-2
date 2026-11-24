import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function parseCorsOrigin(raw?: string): string | string[] {
  if (!raw?.trim()) {
    return '*';
  }

  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0 || origins.includes('*')) {
    return '*';
  }

  return origins.length === 1 ? origins[0] : origins;
}

// Global configuration shared by the real app (main.ts) and the e2e tests
export function setupApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  app.enableCors({ origin: parseCorsOrigin(config.get<string>('CORS_ORIGIN')) });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}
