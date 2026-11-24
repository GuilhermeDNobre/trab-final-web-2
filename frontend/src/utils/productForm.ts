import type { Product, ProductCategory, ProductStatus } from '../types/Product';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export interface ProductFormValues {
  name: string;
  price: string;
  category: ProductCategory;
  status: ProductStatus;
  imageFile: File | null;
  imagePreviewUrl: string;
  description: string;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

export interface ProductPayload {
  name: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  imageFile?: File;
  imageUrl?: string;
  description?: string;
}

export const INITIAL_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: '',
  price: '',
  category: 'cervejas',
  status: 'disponivel',
  imageFile: null,
  imagePreviewUrl: '',
  description: '',
};

export const getInitialFormValues = (
  product?: Product | null,
): ProductFormValues => {
  if (!product) {
    return INITIAL_PRODUCT_FORM_VALUES;
  }

  return {
    name: product.name,
    price: String(product.price),
    category: product.category,
    status: product.status,
    imageFile: null,
    imagePreviewUrl: product.imageUrl ?? '',
    description: product.description ?? '',
  };
};

export const validateImageFile = (file: File): string | null => {
  if (!file.type.startsWith('image/')) {
    return 'Selecione um arquivo de imagem válido (PNG, JPG, WEBP, etc.).';
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'A imagem deve ter no máximo 5 MB.';
  }

  return null;
};

export const validateProductForm = (
  values: ProductFormValues,
): ProductFormErrors => {
  const errors: ProductFormErrors = {};
  const trimmedName = values.name.trim();
  const parsedPrice = Number(values.price.replace(',', '.'));

  if (trimmedName.length < 2) {
    errors.name = 'Informe um nome com pelo menos 2 caracteres.';
  }

  if (!values.price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
    errors.price = 'Informe um preço válido maior que zero.';
  }

  if (values.imageFile) {
    const imageError = validateImageFile(values.imageFile);
    if (imageError) {
      errors.imageFile = imageError;
    }
  }

  return errors;
};

export const hasProductFormErrors = (errors: ProductFormErrors): boolean =>
  Object.keys(errors).length > 0;

export const toProductPayload = (values: ProductFormValues): ProductPayload => {
  const trimmedDescription = values.description.trim();

  return {
    name: values.name.trim(),
    price: Number(Number(values.price.replace(',', '.')).toFixed(2)),
    category: values.category,
    status: values.status,
    ...(values.imageFile ? { imageFile: values.imageFile } : {}),
    ...(values.imagePreviewUrl ? { imageUrl: values.imagePreviewUrl } : {}),
    ...(trimmedDescription ? { description: trimmedDescription } : {}),
  };
};

const toProductFields = (
  payload: ProductPayload,
): Omit<Product, '_id' | 'createdAt' | 'updatedAt'> => ({
  name: payload.name,
  price: payload.price,
  category: payload.category,
  status: payload.status,
  ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
  ...(payload.description ? { description: payload.description } : {}),
});

export const createProductRecord = (
  payload: ProductPayload,
  now: string,
): Product => ({
  _id: `local-${Date.now()}`,
  ...toProductFields(payload),
  createdAt: now,
  updatedAt: now,
});

export const updateProductRecord = (
  existing: Product,
  payload: ProductPayload,
  now: string,
): Product => ({
  _id: existing._id,
  ...toProductFields(payload),
  createdAt: existing.createdAt,
  updatedAt: now,
});
