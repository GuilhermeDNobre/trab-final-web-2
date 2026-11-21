import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Container, Drawer, Grid, Snackbar } from '@mui/material';
import { CATEGORIES } from '../constants/categories';
import { useCart } from '../hooks/useCart';
import { TopInfoBar } from '../components/layout/TopInfoBar';
import { Navbar } from '../components/layout/Navbar';
import { SearchHeader } from '../components/products/SearchHeader';
import { FiltersSidebar } from '../components/products/FiltersSidebar';
import { ActiveFiltersBar } from '../components/products/ActiveFiltersBar';
import { ProductsGrid } from '../components/products/ProductsGrid';
import { MOCK_PRODUCTS } from '../constants/mockProducts';
import { api } from '../services/api';
import type { Product, ProductCategory } from '../types/Product';
import {
  filterAndSortProducts,
  type ProductFilters,
  type SortOption,
} from '../utils/products';

const ITEMS_PER_PAGE = 9;

const INITIAL_FILTERS: ProductFilters = {
  searchTerm: '',
  categories: [],
  priceRange: [0, 300],
  sortBy: 'relevance',
};

const isValidCategory = (value: string | null): value is ProductCategory =>
  CATEGORIES.some((cat) => cat.id === value);

export const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('categoria');
  const { addItem } = useCart();

  const [products, setProducts] = useState<readonly Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...INITIAL_FILTERS,
    categories: isValidCategory(initialCategory) ? [initialCategory] : [],
  }));
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [addedProductName, setAddedProductName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await api.get<Product[]>('/products');
        if (isMounted) {
          setProducts(response.data);
        }
      } catch {
        if (isMounted) {
          setProducts(MOCK_PRODUCTS);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, filters),
    [products, filters],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  const updateFilters = (updater: (prev: ProductFilters) => ProductFilters) => {
    setFilters(updater);
    setPage(1);
  };

  const handleToggleCategory = (category: ProductCategory) => {
    updateFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((item) => item !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSearch = (searchTerm: string) => {
    updateFilters((prev) => ({ ...prev, searchTerm }));
  };

  const handlePriceRangeChange = (priceRange: [number, number]) => {
    updateFilters((prev) => ({ ...prev, priceRange }));
  };

  const handleSortChange = (sortBy: SortOption) => {
    updateFilters((prev) => ({ ...prev, sortBy }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedProductName(product.name);
  };

  const sidebarContent = (
    <FiltersSidebar
      selectedCategories={filters.categories}
      priceRange={filters.priceRange}
      sortBy={filters.sortBy}
      onToggleCategory={handleToggleCategory}
      onChangePriceRange={handlePriceRangeChange}
      onChangeSort={handleSortChange}
      onResetFilters={handleResetFilters}
    />
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.50',
      }}
    >
      <header>
        <TopInfoBar />
        <Navbar />
      </header>

      <Box sx={{ flexGrow: 1 }}>
        <main>
          <SearchHeader
            key={filters.searchTerm}
            initialValue={filters.searchTerm}
            onSearch={handleSearch}
          />

          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
            <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
              <Grid
                size={{ xs: 12, md: 3 }}
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                {sidebarContent}
              </Grid>

              <Grid size={{ xs: 12, md: 9 }}>
                <ActiveFiltersBar
                  totalResults={filteredProducts.length}
                  searchTerm={filters.searchTerm}
                  selectedCategories={filters.categories}
                  onClearSearch={() => handleSearch('')}
                  onRemoveCategory={handleToggleCategory}
                  onOpenMobileFilters={() => setMobileFiltersOpen(true)}
                />

                <ProductsGrid
                  products={paginatedProducts}
                  isLoading={isLoading}
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onAddToCart={handleAddToCart}
                  onResetFilters={handleResetFilters}
                />
              </Grid>
            </Grid>
          </Container>
        </main>
      </Box>

      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        sx={{ display: { md: 'none' } }}
      >
        <Box sx={{ width: 290, p: 2 }}>{sidebarContent}</Box>
      </Drawer>

      <Snackbar
        open={Boolean(addedProductName)}
        autoHideDuration={2500}
        onClose={() => setAddedProductName(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setAddedProductName(null)}
        >
          {addedProductName} adicionado ao carrinho
        </Alert>
      </Snackbar>
    </Box>
  );
};
