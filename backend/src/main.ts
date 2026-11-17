import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({ origin: config.get<string>('CORS_ORIGIN') ?? '*' });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Gean Bebidas API')
    .setDescription('Public catalog routes and JWT-protected admin routes.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(config.get('PORT')) || 3000;
  await app.listen(port);
  console.log(`API listening on port ${port} (docs at /docs)`);
}

await bootstrap();
