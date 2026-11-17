export type ProductCategory =
  | 'beers'
  | 'spirits'
  | 'soft-drinks'
  | 'snacks'
  | 'ice';

export type ProductStatus = 'available' | 'out-of-stock';

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
