export type ProductCategory =
  | 'cervejas'
  | 'destilados'
  | 'nao_alcolicos'
  | 'petiscos'
  | 'gelo';

export type ProductStatus = 'disponivel' | 'indisponivel';

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
