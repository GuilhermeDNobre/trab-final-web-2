import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateProductDto } from './create-product.dto.js';
import { ListAdminProductsQueryDto } from './list-admin-products-query.dto.js';
import { ListProductsQueryDto } from './list-products-query.dto.js';
import { UpdateProductStatusDto } from './update-product-status.dto.js';
import { UpdateProductDto } from './update-product.dto.js';

const validProduct = { name: 'Skol Lata 350ml', price: 4.5, category: 'beers' };

async function errorsFor<T extends object>(cls: new () => T, plain: object) {
  const errors = await validate(plainToInstance(cls, plain));
  return errors.map((error) => error.property);
}

describe('CreateProductDto', () => {
  it('accepts a minimal valid product', async () => {
    expect(await errorsFor(CreateProductDto, validProduct)).toEqual([]);
  });

  it('accepts optional fields', async () => {
    const plain = { ...validProduct, status: 'out-of-stock', imageUrl: 'http://x/y.png', description: 'd' };
    expect(await errorsFor(CreateProductDto, plain)).toEqual([]);
  });

  it('accepts a price of zero', async () => {
    expect(await errorsFor(CreateProductDto, { ...validProduct, price: 0 })).toEqual([]);
  });

  it('rejects a negative price', async () => {
    expect(await errorsFor(CreateProductDto, { ...validProduct, price: -1 })).toEqual(['price']);
  });

  it('rejects a price with more than two decimals', async () => {
    expect(await errorsFor(CreateProductDto, { ...validProduct, price: 1.999 })).toEqual(['price']);
  });

  it('rejects a price sent as text', async () => {
    expect(await errorsFor(CreateProductDto, { ...validProduct, price: '4.5' })).toEqual(['price']);
  });

  it('rejects an unknown category', async () => {
    expect(await errorsFor(CreateProductDto, { ...validProduct, category: 'wine' })).toEqual(['category']);
  });

  it('rejects an unknown status', async () => {
    expect(await errorsFor(CreateProductDto, { ...validProduct, status: 'gone' })).toEqual(['status']);
  });

  it('rejects a missing or blank name', async () => {
    expect(await errorsFor(CreateProductDto, { price: 1, category: 'ice' })).toEqual(['name']);
    expect(await errorsFor(CreateProductDto, { ...validProduct, name: '   ' })).toEqual(['name']);
  });

  it('trims the name', () => {
    const dto = plainToInstance(CreateProductDto, { ...validProduct, name: '  Skol  ' });
    expect(dto.name).toBe('Skol');
  });

  it('treats blank optional imageUrl and description as omitted', async () => {
    const dto = plainToInstance(CreateProductDto, {
      ...validProduct,
      imageUrl: '   ',
      description: '',
    });

    expect(dto.imageUrl).toBeUndefined();
    expect(dto.description).toBeUndefined();
    expect(await validate(dto)).toEqual([]);
  });

  it.each(['javascript:alert(1)', 'data:image/png;base64,abc', 'not-a-url'])(
    'rejects invalid imageUrl "%s"',
    async (imageUrl) => {
      expect(await errorsFor(CreateProductDto, { ...validProduct, imageUrl })).toEqual([
        'imageUrl',
      ]);
    },
  );

  it('rejects overly long name or description', async () => {
    expect(await errorsFor(CreateProductDto, { ...validProduct, name: 'a'.repeat(121) })).toEqual([
      'name',
    ]);
    expect(
      await errorsFor(CreateProductDto, { ...validProduct, description: 'a'.repeat(501) }),
    ).toEqual(['description']);
  });
});

describe('UpdateProductDto', () => {
  it('accepts a partial update', async () => {
    expect(await errorsFor(UpdateProductDto, { price: 5 })).toEqual([]);
    expect(await errorsFor(UpdateProductDto, {})).toEqual([]);
  });

  it('still validates the provided fields', async () => {
    expect(await errorsFor(UpdateProductDto, { price: -5 })).toEqual(['price']);
    expect(await errorsFor(UpdateProductDto, { imageUrl: 'javascript:alert(1)' })).toEqual([
      'imageUrl',
    ]);
  });

  it('accepts null and transforms blank strings to null so optional fields can be cleared', async () => {
    const fromNull = plainToInstance(UpdateProductDto, { imageUrl: null, description: null });
    expect(await validate(fromNull)).toEqual([]);
    expect(fromNull.imageUrl).toBeNull();
    expect(fromNull.description).toBeNull();

    const fromEmpty = plainToInstance(UpdateProductDto, { imageUrl: '  ', description: '' });
    expect(await validate(fromEmpty)).toEqual([]);
    expect(fromEmpty.imageUrl).toBeNull();
    expect(fromEmpty.description).toBeNull();
  });
});

describe('UpdateProductStatusDto', () => {
  it.each(['available', 'out-of-stock'])('accepts "%s"', async (status) => {
    expect(await errorsFor(UpdateProductStatusDto, { status })).toEqual([]);
  });

  it('rejects other values and a missing status', async () => {
    expect(await errorsFor(UpdateProductStatusDto, { status: 'nope' })).toEqual(['status']);
    expect(await errorsFor(UpdateProductStatusDto, {})).toEqual(['status']);
  });
});

describe('ListProductsQueryDto', () => {
  it('accepts no filters', async () => {
    expect(await errorsFor(ListProductsQueryDto, {})).toEqual([]);
  });

  it('accepts a valid category and search', async () => {
    expect(await errorsFor(ListProductsQueryDto, { category: 'beers', search: 'skol' })).toEqual([]);
  });

  it('treats empty strings as not provided', async () => {
    const dto = plainToInstance(ListProductsQueryDto, { category: '', search: '  ' });

    expect(dto.category).toBeUndefined();
    expect(dto.search).toBeUndefined();
    expect(await validate(dto)).toEqual([]);
  });

  it('rejects an unknown category', async () => {
    expect(await errorsFor(ListProductsQueryDto, { category: 'wine' })).toEqual(['category']);
  });
});

describe('ListAdminProductsQueryDto', () => {
  it('accepts valid status, category and search filters', async () => {
    expect(
      await errorsFor(ListAdminProductsQueryDto, {
        category: 'beers',
        search: 'skol',
        status: 'out-of-stock',
      }),
    ).toEqual([]);
  });

  it('treats an empty status as not provided', async () => {
    const dto = plainToInstance(ListAdminProductsQueryDto, { status: '  ' });

    expect(dto.status).toBeUndefined();
    expect(await validate(dto)).toEqual([]);
  });

  it('rejects an unknown status', async () => {
    expect(await errorsFor(ListAdminProductsQueryDto, { status: 'gone' })).toEqual(['status']);
  });
});
