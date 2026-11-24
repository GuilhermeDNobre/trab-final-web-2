import { api } from './api';
import type { Product, ProductCategory, ProductStatus } from '../types/Product';

export interface ListProductsParams {
  category?: ProductCategory;
  search?: string;
}

export interface ListAdminProductsParams extends ListProductsParams {
  status?: ProductStatus;
}

export interface CreateProductInput {
  name: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  imageUrl?: string;
  description?: string;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  category?: ProductCategory;
  status?: ProductStatus;
  imageUrl?: string | null;
  description?: string | null;
}

export const listPublicProducts = async (
  params?: ListProductsParams,
): Promise<Product[]> => {
  const { data } = await api.get<Product[]>('/products', { params });
  return data;
};

export const listAdminProducts = async (
  params?: ListAdminProductsParams,
): Promise<Product[]> => {
  const { data } = await api.get<Product[]>('/admin/products', { params });
  return data;
};

export const createAdminProduct = async (
  input: CreateProductInput,
): Promise<Product> => {
  const { data } = await api.post<Product>('/admin/products', input);
  return data;
};

export const updateAdminProduct = async (
  id: string,
  input: UpdateProductInput,
): Promise<Product> => {
  const { data } = await api.put<Product>(`/admin/products/${id}`, input);
  return data;
};

export const updateAdminProductStatus = async (
  id: string,
  status: ProductStatus,
): Promise<Product> => {
  const { data } = await api.patch<Product>(`/admin/products/${id}/status`, {
    status,
  });
  return data;
};

export const deleteAdminProduct = async (id: string): Promise<void> => {
  await api.delete(`/admin/products/${id}`);
};

export const uploadProductImage = async (
  file: File,
): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<{ imageUrl: string }>(
    '/admin/products/upload',
    formData,
  );
  return data;
};
