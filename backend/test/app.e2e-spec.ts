import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Model } from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Admin } from '../src/admins/admin.schema.js';
import { LoginRateLimitGuard } from '../src/auth/login-rate-limit.guard.js';
import type { Product } from '../src/products/schemas/product.schema.js';
import { MAX_IMAGE_SIZE_BYTES, R2_S3_CLIENT } from '../src/storage/storage.constants.js';

const ADMIN_EMAIL = 'admin@geanbebidas.com';
const ADMIN_PASSWORD = 'test-password-123';
const MISSING_ID = '64b000000000000000000000';
const PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

describe('Gean Bebidas API (e2e)', () => {
  let mongo: MongoMemoryServer;
  let app: INestApplication;
  let adminModel: Model<Admin>;
  let productModel: Model<Product>;
  let token: string;
  const r2Send = vi.fn();

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();

    // Always an in-memory database: the tests must never reach a real one
    process.env.MONGODB_URI = mongo.getUri('gean-bebidas-test');
    process.env.JWT_SECRET = 'e2e-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.CORS_ORIGIN = 'http://localhost:5173,https://gean-bebidas.vercel.app';
    process.env.R2_BUCKET_NAME = 'gean-bebidas-test';
    process.env.R2_PUBLIC_URL = 'https://cdn.geanbebidas.test';

    // Imported after the env is set because the config is validated on import
    const { AppModule } = await import('../src/app.module.js');
    const { setupApp } = await import('../src/app.setup.js');

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(R2_S3_CLIENT)
      .useValue({ send: r2Send })
      .compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();

    adminModel = app.get(getModelToken('Admin'), { strict: false });
    productModel = app.get(getModelToken('Product'), { strict: false });
  });

  afterAll(async () => {
    await app?.close();
    await mongo?.stop();
  });

  beforeEach(async () => {
    r2Send.mockReset();
    r2Send.mockResolvedValue({});
    app.get(LoginRateLimitGuard).reset();

    await Promise.all([adminModel.deleteMany({}), productModel.deleteMany({})]);
    await adminModel.create({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    await productModel.insertMany([
      { name: 'Skol Lata 350ml', price: 4.5, category: 'beers' },
      { name: 'Heineken Long Neck', price: 8.9, category: 'beers' },
      { name: 'Whisky Red Label 1L', price: 89.9, category: 'spirits', status: 'out-of-stock' },
      { name: 'Coca-Cola 2L', price: 11, category: 'soft-drinks' },
      { name: 'Guaraná Antarctica Lata 350ml', price: 4.2, category: 'soft-drinks' },
      { name: 'Água Mineral 500ml', price: 3, category: 'soft-drinks' },
    ]);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    token = login.body.token;
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  describe('health, security headers and CORS', () => {
    it('reports the database connection and sets Helmet security headers', async () => {
      const response = await request(app.getHttpServer()).get('/health').expect(200);

      expect(response.body).toEqual({ status: 'ok', database: 'connected' });
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('allows every origin listed in CORS_ORIGIN and blocks others', async () => {
      const local = await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200);
      expect(local.headers['access-control-allow-origin']).toBe('http://localhost:5173');

      const prod = await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'https://gean-bebidas.vercel.app')
        .expect(200);
      expect(prod.headers['access-control-allow-origin']).toBe('https://gean-bebidas.vercel.app');

      const blocked = await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'https://evil.example.com')
        .expect(200);
      expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('public catalog (RN01)', () => {
    it('lists only available products', async () => {
      const response = await request(app.getHttpServer()).get('/products').expect(200);

      const names = response.body.map((product: Product) => product.name);
      expect(names).toEqual([
        'Coca-Cola 2L',
        'Guaraná Antarctica Lata 350ml',
        'Heineken Long Neck',
        'Skol Lata 350ml',
        'Água Mineral 500ml',
      ]);
      expect(response.body.every((product: Product) => product.status === 'available')).toBe(true);
    });

    it('filters by category', async () => {
      const response = await request(app.getHttpServer()).get('/products?category=beers').expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('never exposes an out-of-stock product through a category filter', async () => {
      const response = await request(app.getHttpServer()).get('/products?category=spirits').expect(200);

      expect(response.body).toEqual([]);
    });

    it('searches by name ignoring case', async () => {
      const response = await request(app.getHttpServer()).get('/products?search=SKOL').expect(200);

      expect(response.body.map((product: Product) => product.name)).toEqual(['Skol Lata 350ml']);
    });

    it('searches by name ignoring accents in both directions', async () => {
      const guarana = await request(app.getHttpServer()).get('/products?search=guarana').expect(200);
      expect(guarana.body.map((product: Product) => product.name)).toEqual([
        'Guaraná Antarctica Lata 350ml',
      ]);

      const agua = await request(app.getHttpServer()).get('/products?search=agua').expect(200);
      expect(agua.body.map((product: Product) => product.name)).toEqual(['Água Mineral 500ml']);

      const accentedQuery = await request(app.getHttpServer())
        .get('/products?search=skól')
        .expect(200);
      expect(accentedQuery.body.map((product: Product) => product.name)).toEqual([
        'Skol Lata 350ml',
      ]);
    });

    it('treats regex characters in the search as plain text', async () => {
      const response = await request(app.getHttpServer()).get('/products?search=.*').expect(200);

      expect(response.body).toEqual([]);
    });

    it('combines category and search', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?category=beers&search=heineken')
        .expect(200);

      expect(response.body).toHaveLength(1);
    });

    it('rejects an invalid category', async () => {
      await request(app.getHttpServer()).get('/products?category=wine').expect(400);
    });

    it('returns an available product by id', async () => {
      const product = await productModel.findOne({ name: 'Skol Lata 350ml' });

      const response = await request(app.getHttpServer()).get(`/products/${product!.id}`).expect(200);

      expect(response.body.name).toBe('Skol Lata 350ml');
    });

    it('returns 404 for an out-of-stock product', async () => {
      const product = await productModel.findOne({ status: 'out-of-stock' });

      await request(app.getHttpServer()).get(`/products/${product!.id}`).expect(404);
    });

    it('returns 400 for a malformed id and 404 for an unknown one', async () => {
      await request(app.getHttpServer()).get('/products/not-an-id').expect(400);
      await request(app.getHttpServer()).get(`/products/${MISSING_ID}`).expect(404);
    });

    it('returns 404 for an unknown route', async () => {
      await request(app.getHttpServer()).get('/nope').expect(404);
    });
  });

  describe('authentication', () => {
    it('returns a token for valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        .expect(200);

      expect(response.body.token).toEqual(expect.any(String));
      expect(JSON.stringify(response.body)).not.toContain('password');
    });

    it('accepts the email in a different case', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ADMIN@GeanBebidas.com', password: ADMIN_PASSWORD })
        .expect(200);
    });

    it('rejects a wrong password and an unknown email with 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: 'wrong' })
        .expect(401);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: ADMIN_PASSWORD })
        .expect(401);
    });

    it('rejects a malformed body with 400', async () => {
      await request(app.getHttpServer()).post('/auth/login').send({}).expect(400);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'x' })
        .expect(400);
    });

    it('stores the password hashed', async () => {
      const admin = await adminModel.findOne({ email: ADMIN_EMAIL }).select('+password');

      expect(admin!.password).not.toBe(ADMIN_PASSWORD);
      expect(admin!.password).toMatch(/^\$2[aby]\$/);
    });

    it('returns the authenticated admin profile on GET /auth/me', async () => {
      const admin = await adminModel.findOne({ email: ADMIN_EMAIL });
      const response = await request(app.getHttpServer()).get('/auth/me').set(auth()).expect(200);

      expect(response.body).toEqual({ id: admin!.id, email: ADMIN_EMAIL });
      expect(JSON.stringify(response.body)).not.toContain('password');
    });

    it('rejects GET /auth/me without a valid token or for a deleted admin', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      await adminModel.deleteMany({});
      await request(app.getHttpServer()).get('/auth/me').set(auth()).expect(401);
    });

    it('rate-limits repeated login attempts per client IP with 429 and Retry-After', async () => {
      const attackerIp = '203.0.113.10';

      for (let attempt = 0; attempt < 10; attempt += 1) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .set('X-Forwarded-For', attackerIp)
          .send({ email: ADMIN_EMAIL, password: 'wrong' })
          .expect(401);
      }

      const blocked = await request(app.getHttpServer())
        .post('/auth/login')
        .set('X-Forwarded-For', attackerIp)
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        .expect(429);

      expect(blocked.headers['retry-after']).toBeDefined();

      // Another IP behind the proxy is still allowed
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('X-Forwarded-For', '203.0.113.11')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        .expect(200);
    });
  });

  describe('admin routes require a token (RN02)', () => {
    const routes: Array<[string, string]> = [
      ['get', '/auth/me'],
      ['get', '/admin/products'],
      ['get', `/admin/products/${MISSING_ID}`],
      ['post', '/admin/products/upload'],
      ['post', '/admin/products'],
      ['put', `/admin/products/${MISSING_ID}`],
      ['patch', `/admin/products/${MISSING_ID}/status`],
      ['delete', `/admin/products/${MISSING_ID}`],
    ];

    it.each(routes)('%s %s returns 401 without a token', async (method, path) => {
      const server = request(app.getHttpServer());
      await (server as unknown as Record<string, (p: string) => request.Test>)[method](path)
        .send({})
        .expect(401);
    });

    it.each(routes)('%s %s returns 401 with an invalid token', async (method, path) => {
      const server = request(app.getHttpServer());
      await (server as unknown as Record<string, (p: string) => request.Test>)[method](path)
        .set('Authorization', 'Bearer invalid.token.here')
        .send({})
        .expect(401);
    });

    it('does not change the database when unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/admin/products')
        .send({ name: 'Intruder', price: 1, category: 'ice' })
        .expect(401);

      expect(await productModel.countDocuments({ name: 'Intruder' })).toBe(0);
    });
  });

  describe('admin product management', () => {
    it('lists every product, including out-of-stock ones', async () => {
      const response = await request(app.getHttpServer()).get('/admin/products').set(auth()).expect(200);

      expect(response.body).toHaveLength(6);
    });

    it('gets a single product by id, including out-of-stock ones', async () => {
      const outOfStock = await productModel.findOne({ status: 'out-of-stock' });
      const response = await request(app.getHttpServer())
        .get(`/admin/products/${outOfStock!.id}`)
        .set(auth())
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Whisky Red Label 1L',
        status: 'out-of-stock',
      });

      await request(app.getHttpServer()).get('/admin/products/abc').set(auth()).expect(400);
      await request(app.getHttpServer())
        .get(`/admin/products/${MISSING_ID}`)
        .set(auth())
        .expect(404);
    });

    it('creates a product with status available by default', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/products')
        .set(auth())
        .send({ name: '  Brahma Lata  ', price: 4.3, category: 'beers' })
        .expect(201);

      expect(response.body).toMatchObject({ name: 'Brahma Lata', price: 4.3, status: 'available' });
      expect(await productModel.countDocuments()).toBe(7);
    });

    it('ignores unknown fields on create', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/products')
        .set(auth())
        .send({ name: 'Gelo', price: 12, category: 'ice', isAdmin: true })
        .expect(201);

      expect(response.body.isAdmin).toBeUndefined();
    });

    it.each([
      [{ price: 1, category: 'ice' }, 'missing name'],
      [{ name: 'x', price: -1, category: 'ice' }, 'negative price'],
      [{ name: 'x', price: 1, category: 'wine' }, 'invalid category'],
      [{ name: 'x', price: 1, category: 'ice', status: 'gone' }, 'invalid status'],
      [{ name: 'x', price: 1, category: 'ice', imageUrl: 'javascript:alert(1)' }, 'unsafe imageUrl'],
    ])('rejects %j (%s) with 400', async (body) => {
      await request(app.getHttpServer()).post('/admin/products').set(auth()).send(body).expect(400);
    });

    it('updates a product and clears optional fields when sent as null or empty string', async () => {
      const product = await productModel.findOne({ name: 'Skol Lata 350ml' });

      const updated = await request(app.getHttpServer())
        .put(`/admin/products/${product!.id}`)
        .set(auth())
        .send({
          price: 5.9,
          description: 'Updated',
          imageUrl: 'https://cdn.geanbebidas.test/products/skol.png',
        })
        .expect(200);

      expect(updated.body).toMatchObject({
        name: 'Skol Lata 350ml',
        price: 5.9,
        description: 'Updated',
        imageUrl: 'https://cdn.geanbebidas.test/products/skol.png',
      });

      const cleared = await request(app.getHttpServer())
        .put(`/admin/products/${product!.id}`)
        .set(auth())
        .send({ imageUrl: null, description: '' })
        .expect(200);

      expect(cleared.body.imageUrl).toBeUndefined();
      expect(cleared.body.description).toBeUndefined();
    });

    it('rejects an invalid update and leaves the product untouched', async () => {
      const product = await productModel.findOne({ name: 'Skol Lata 350ml' });

      await request(app.getHttpServer())
        .put(`/admin/products/${product!.id}`)
        .set(auth())
        .send({ price: -5 })
        .expect(400);

      expect((await productModel.findById(product!.id))!.price).toBe(4.5);
    });

    it('returns 404 when updating or deleting an unknown product', async () => {
      await request(app.getHttpServer())
        .put(`/admin/products/${MISSING_ID}`)
        .set(auth())
        .send({ price: 1 })
        .expect(404);
      await request(app.getHttpServer()).delete(`/admin/products/${MISSING_ID}`).set(auth()).expect(404);
    });

    it('returns 400 for a malformed id', async () => {
      await request(app.getHttpServer()).put('/admin/products/abc').set(auth()).send({}).expect(400);
      await request(app.getHttpServer()).delete('/admin/products/abc').set(auth()).expect(400);
    });

    it('deletes a product', async () => {
      const product = await productModel.findOne({ name: 'Coca-Cola 2L' });

      await request(app.getHttpServer()).delete(`/admin/products/${product!.id}`).set(auth()).expect(204);

      expect(await productModel.findById(product!.id)).toBeNull();
    });

    it('filters the admin list by category, status and search', async () => {
      const byCategory = await request(app.getHttpServer())
        .get('/admin/products?category=spirits')
        .set(auth())
        .expect(200);
      expect(byCategory.body.map((product: Product) => product.name)).toEqual(['Whisky Red Label 1L']);

      const outOfStock = await request(app.getHttpServer())
        .get('/admin/products?status=out-of-stock')
        .set(auth())
        .expect(200);
      expect(outOfStock.body.map((product: Product) => product.name)).toEqual(['Whisky Red Label 1L']);

      const available = await request(app.getHttpServer())
        .get('/admin/products?status=available')
        .set(auth())
        .expect(200);
      expect(available.body).toHaveLength(5);

      await request(app.getHttpServer())
        .get('/admin/products?status=invalid')
        .set(auth())
        .expect(400);
    });
  });

  describe('availability status (RN01 + RF07)', () => {
    it('hides a product from the storefront once it is out of stock, and shows it again', async () => {
      const product = await productModel.findOne({ name: 'Skol Lata 350ml' });
      const id = product!.id;

      await request(app.getHttpServer()).get(`/products/${id}`).expect(200);

      await request(app.getHttpServer())
        .patch(`/admin/products/${id}/status`)
        .set(auth())
        .send({ status: 'out-of-stock' })
        .expect(200)
        .expect((response) => expect(response.body.status).toBe('out-of-stock'));

      await request(app.getHttpServer()).get(`/products/${id}`).expect(404);
      const list = await request(app.getHttpServer()).get('/products').expect(200);
      expect(list.body.map((item: Product) => item.name)).not.toContain('Skol Lata 350ml');

      await request(app.getHttpServer())
        .patch(`/admin/products/${id}/status`)
        .set(auth())
        .send({ status: 'available' })
        .expect(200);

      await request(app.getHttpServer()).get(`/products/${id}`).expect(200);
    });

    it('rejects an invalid status and a missing one', async () => {
      const product = await productModel.findOne({ name: 'Skol Lata 350ml' });

      await request(app.getHttpServer())
        .patch(`/admin/products/${product!.id}/status`)
        .set(auth())
        .send({ status: 'gone' })
        .expect(400);
      await request(app.getHttpServer())
        .patch(`/admin/products/${product!.id}/status`)
        .set(auth())
        .send({})
        .expect(400);
    });

    it('returns 404 for an unknown product', async () => {
      await request(app.getHttpServer())
        .patch(`/admin/products/${MISSING_ID}/status`)
        .set(auth())
        .send({ status: 'available' })
        .expect(404);
    });
  });

  describe('product image upload (R2)', () => {
    it('uploads a valid image and returns its public URL', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/products/upload')
        .set(auth())
        .attach('file', PNG_BUFFER, { filename: 'skol.png', contentType: 'image/png' })
        .expect(201);

      expect(response.body.imageUrl).toMatch(
        /^https:\/\/cdn\.geanbebidas\.test\/products\/[0-9a-f-]+\.png$/,
      );
      expect(r2Send).toHaveBeenCalledTimes(1);
      expect(r2Send.mock.calls[0][0]).toBeInstanceOf(PutObjectCommand);
    });

    it('rejects a missing file, SVG, and spoofed image signatures with 400', async () => {
      await request(app.getHttpServer()).post('/admin/products/upload').set(auth()).expect(400);

      await request(app.getHttpServer())
        .post('/admin/products/upload')
        .set(auth())
        .attach('file', Buffer.from('<svg></svg>'), {
          filename: 'icon.svg',
          contentType: 'image/svg+xml',
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/admin/products/upload')
        .set(auth())
        .attach('file', Buffer.from('not-a-png'), {
          filename: 'fake.png',
          contentType: 'image/png',
        })
        .expect(400);

      expect(r2Send).not.toHaveBeenCalled();
    });

    it('rejects images larger than 5 MB with 413', async () => {
      const oversized = Buffer.concat([PNG_BUFFER, Buffer.alloc(MAX_IMAGE_SIZE_BYTES)]);

      await request(app.getHttpServer())
        .post('/admin/products/upload')
        .set(auth())
        .attach('file', oversized, { filename: 'huge.png', contentType: 'image/png' })
        .expect(413);

      expect(r2Send).not.toHaveBeenCalled();
    });
  });
});
