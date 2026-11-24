import type { Product, ProductCategory } from '../types/Product';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc';

export interface ProductFilters {
  searchTerm: string;
  categories: ProductCategory[];
  priceRange: [number, number];
  sortBy: SortOption;
}

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const formatPriceBRL = (value: number): string =>
  BRL_FORMATTER.format(value);

export const normalizeSearchText = (value: string): string =>
  value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const matchesSearch = (product: Product, term: string): boolean => {
  const normalized = normalizeSearchText(term);
  if (!normalized) return true;
  return normalizeSearchText(product.name).includes(normalized);
};

const matchesCategory = (
  product: Product,
  categories: ProductCategory[],
): boolean => categories.length === 0 || categories.includes(product.category);

const matchesPriceRange = (
  product: Product,
  [min, max]: [number, number],
): boolean => {
  const aboveMin = product.price >= min;
  const belowMax = max >= 300 ? true : product.price <= max;
  return aboveMin && belowMax;
};

const COMPARATORS: Record<SortOption, (a: Product, b: Product) => number> = {
  relevance: () => 0,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'name-asc': (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
};

export const filterAndSortProducts = (
  products: readonly Product[],
  filters: ProductFilters,
): Product[] => {
  const filtered = products.filter(
    (product) =>
      product.status === 'available' &&
      matchesSearch(product, filters.searchTerm) &&
      matchesCategory(product, filters.categories) &&
      matchesPriceRange(product, filters.priceRange),
  );

  if (filters.sortBy === 'relevance') {
    return filtered;
  }

  return [...filtered].sort(COMPARATORS[filters.sortBy]);
};
