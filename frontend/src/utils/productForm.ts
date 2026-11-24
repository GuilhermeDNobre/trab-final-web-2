import type { Product, ProductCategory, ProductStatus } from '../types/Product';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_NAME_LENGTH = 120;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 500;

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export const ACCEPTED_IMAGE_TYPES = ALLOWED_IMAGE_MIME_TYPES.join(',');

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
  imageFile: File | null;
  imageUrl: string | null;
  description: string | null;
}

export const INITIAL_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: '',
  price: '',
  category: 'beers',
  status: 'available',
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
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return 'Formato não suportado. Use JPG, PNG, WEBP, GIF ou AVIF.';
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
  const trimmedDescription = values.description.trim();
  const parsedPrice = Number(values.price.replace(',', '.'));

  if (trimmedName.length < 2) {
    errors.name = 'Informe um nome com pelo menos 2 caracteres.';
  } else if (trimmedName.length > MAX_PRODUCT_NAME_LENGTH) {
    errors.name = `O nome deve ter no máximo ${MAX_PRODUCT_NAME_LENGTH} caracteres.`;
  }

  if (!values.price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
    errors.price = 'Informe um preço válido maior que zero.';
  }

  if (trimmedDescription.length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
    errors.description = `A descrição deve ter no máximo ${MAX_PRODUCT_DESCRIPTION_LENGTH} caracteres.`;
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
  const trimmedImageUrl = values.imagePreviewUrl.trim();

  return {
    name: values.name.trim(),
    price: Number(Number(values.price.replace(',', '.')).toFixed(2)),
    category: values.category,
    status: values.status,
    imageFile: values.imageFile,
    imageUrl: values.imageFile ? null : trimmedImageUrl || null,
    description: trimmedDescription || null,
  };
};
