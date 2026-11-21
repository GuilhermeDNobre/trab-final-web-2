import {
  Alert,
  Button,
  Grid,
  Pagination,
  Skeleton,
  Stack,
} from '@mui/material';
import type { Product } from '../../types/Product';
import { ProductCard } from './ProductCard';

interface ProductsGridProps {
  products: readonly Product[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddToCart?: (product: Product) => void;
  onResetFilters: () => void;
}

const SKELETON_ITEMS = Array.from({ length: 6 }, (_, index) => index);

export const ProductsGrid = ({
  products,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onAddToCart,
  onResetFilters,
}: ProductsGridProps) => {
  if (isLoading) {
    return (
      <Grid container spacing={2.5}>
        {SKELETON_ITEMS.map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Skeleton
              variant="rounded"
              height={310}
              sx={{ borderRadius: 2.5 }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (products.length === 0) {
    return (
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={onResetFilters}>
            Limpar filtros
          </Button>
        }
      >
        Nenhum produto encontrado para os filtros selecionados.
      </Alert>
    );
  }

  return (
    <Stack spacing={4}>
      <Grid container spacing={2.5}>
        {products.map((product) => (
          <Grid key={product._id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Stack sx={{ alignItems: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, nextPage) => onPageChange(nextPage)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}
    </Stack>
  );
};
