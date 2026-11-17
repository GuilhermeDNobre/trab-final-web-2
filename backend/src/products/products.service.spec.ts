import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductsService } from './products.service.js';
import { Product } from './schemas/product.schema.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let sort: ReturnType<typeof vi.fn>;
  const productModel = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    sort = vi.fn().mockResolvedValue([]);
    productModel.find.mockReturnValue({ sort });

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: productModel },
      ],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  describe('findAll', () => {
    it('only returns available products on the storefront (RN01)', async () => {
      await service.findAll({}, true);

      expect(productModel.find).toHaveBeenCalledWith({ status: 'available' });
    });

    it('does not filter by status for the admin', async () => {
      await service.findAll({}, false);

      expect(productModel.find).toHaveBeenCalledWith({});
    });

    it('filters by category', async () => {
      await service.findAll({ category: 'beers' }, true);

      expect(productModel.find).toHaveBeenCalledWith({ status: 'available', category: 'beers' });
    });

    it('searches by name ignoring case', async () => {
      await service.findAll({ search: 'skol' }, true);

      expect(productModel.find).toHaveBeenCalledWith({
        status: 'available',
        name: { $regex: 'skol', $options: 'i' },
      });
    });

    it('escapes regex special characters in the search term', async () => {
      await service.findAll({ search: 'a.*(b)' }, false);

      expect(productModel.find).toHaveBeenCalledWith({
        name: { $regex: 'a\\.\\*\\(b\\)', $options: 'i' },
      });
    });

    it('ignores a blank search term', async () => {
      await service.findAll({ search: '   ' }, false);

      expect(productModel.find).toHaveBeenCalledWith({});
    });

    it('sorts by name', async () => {
      await service.findAll({}, true);

      expect(sort).toHaveBeenCalledWith({ name: 1 });
    });
  });

  describe('findAvailableById', () => {
    it('returns the product when it is available', async () => {
      const product = { _id: 'id-1', status: 'available' };
      productModel.findOne.mockResolvedValue(product);

      await expect(service.findAvailableById('id-1')).resolves.toBe(product);
      expect(productModel.findOne).toHaveBeenCalledWith({ _id: 'id-1', status: 'available' });
    });

    it('throws NotFoundException when missing or out of stock', async () => {
      productModel.findOne.mockResolvedValue(null);

      await expect(service.findAvailableById('id-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('persists the product', async () => {
      const dto = { name: 'Skol', price: 4.5, category: 'beers' as const };
      productModel.create.mockResolvedValue({ _id: 'id-1', ...dto });

      await expect(service.create(dto)).resolves.toMatchObject(dto);
      expect(productModel.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('updates with validators enabled and returns the new document', async () => {
      const updated = { _id: 'id-1', price: 6 };
      productModel.findByIdAndUpdate.mockResolvedValue(updated);

      await expect(service.update('id-1', { price: 6 })).resolves.toBe(updated);
      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'id-1',
        { price: 6 },
        { returnDocument: 'after', runValidators: true },
      );
    });

    it('throws NotFoundException for an unknown id', async () => {
      productModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update('id-1', { price: 6 })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('changes only the status', async () => {
      productModel.findByIdAndUpdate.mockResolvedValue({ _id: 'id-1', status: 'out-of-stock' });

      await service.updateStatus('id-1', 'out-of-stock');

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'id-1',
        { status: 'out-of-stock' },
        expect.objectContaining({ runValidators: true }),
      );
    });
  });

  describe('remove', () => {
    it('deletes an existing product', async () => {
      productModel.findByIdAndDelete.mockResolvedValue({ _id: 'id-1' });

      await expect(service.remove('id-1')).resolves.toBeUndefined();
      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith('id-1');
    });

    it('throws NotFoundException for an unknown id', async () => {
      productModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove('id-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
