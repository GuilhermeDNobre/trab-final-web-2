export const PRODUCT_CATEGORIES = ['beers', 'spirits', 'soft-drinks', 'snacks', 'ice'] as const;

export const PRODUCT_STATUSES = ['available', 'out-of-stock'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
