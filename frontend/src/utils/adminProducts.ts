import type { Product, ProductCategory, ProductStatus } from '../types/Product';
import { getCategoryLabel } from './adminMetrics';

export type AdminSortField =
  | 'name'
  | 'category'
  | 'price'
  | 'status'
  | 'updatedAt';

export type SortOrder = 'asc' | 'desc';

export interface AdminProductFilters {
  searchTerm: string;
  category: ProductCategory | 'all';
  status: ProductStatus | 'all';
  sortField: AdminSortField;
  sortOrder: SortOrder;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const formatShortDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return DATE_FORMATTER.format(date);
};

const COMPARATORS: Record<AdminSortField, (a: Product, b: Product) => number> = {
  name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
  category: (a, b) =>
    getCategoryLabel(a.category).localeCompare(
      getCategoryLabel(b.category),
      'pt-BR',
    ),
  price: (a, b) => a.price - b.price,
  status: (a, b) => a.status.localeCompare(b.status, 'pt-BR'),
  updatedAt: (a, b) =>
    new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
};

export const filterAndSortAdminProducts = (
  products: readonly Product[],
  filters: AdminProductFilters,
): Product[] => {
  const normalizedSearch = filters.searchTerm.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const matchesSearch =
      !normalizedSearch ||
      product.name.toLowerCase().includes(normalizedSearch);
    const matchesCategory =
      filters.category === 'all' || product.category === filters.category;
    const matchesStatus =
      filters.status === 'all' || product.status === filters.status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const comparator = COMPARATORS[filters.sortField];
  const multiplier = filters.sortOrder === 'asc' ? 1 : -1;

  return [...filtered].sort((a, b) => comparator(a, b) * multiplier);
};
