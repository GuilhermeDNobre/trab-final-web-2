import { CATEGORIES } from '../constants/categories';
import type { Product, ProductCategory } from '../types/Product';

export interface CatalogMetrics {
  total: number;
  availableCount: number;
  unavailableCount: number;
  availablePercentage: number;
  averagePrice: number;
}

export interface CategoryDistributionItem {
  id: ProductCategory;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  cervejas: '#B71C1C',
  destilados: '#E65100',
  nao_alcolicos: '#2E7D32',
  petiscos: '#F9A825',
  gelo: '#0277BD',
};

const CATEGORY_LABELS: Record<ProductCategory, string> = CATEGORIES.reduce(
  (acc, item) => ({ ...acc, [item.id]: item.label }),
  {} as Record<ProductCategory, string>,
);

export const getCategoryLabel = (category: ProductCategory): string =>
  CATEGORY_LABELS[category] ?? category;

export const computeCatalogMetrics = (
  products: readonly Product[],
): CatalogMetrics => {
  const total = products.length;
  if (total === 0) {
    return {
      total: 0,
      availableCount: 0,
      unavailableCount: 0,
      availablePercentage: 0,
      averagePrice: 0,
    };
  }

  const availableCount = products.filter(
    (product) => product.status === 'disponivel',
  ).length;
  const unavailableCount = total - availableCount;
  const availablePercentage = Math.round((availableCount / total) * 100);
  const priceSum = products.reduce((sum, product) => sum + product.price, 0);
  const averagePrice = priceSum / total;

  return {
    total,
    availableCount,
    unavailableCount,
    availablePercentage,
    averagePrice,
  };
};

export const getCategoryDistribution = (
  products: readonly Product[],
): CategoryDistributionItem[] => {
  const total = products.length;

  return CATEGORIES.map((category) => {
    const count = products.filter(
      (product) => product.category === category.id,
    ).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return {
      id: category.id,
      label: category.label,
      count,
      percentage,
      color: CATEGORY_COLORS[category.id],
    };
  });
};

export const getRecentProducts = (
  products: readonly Product[],
  limit = 5,
): Product[] =>
  [...products]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, limit);
