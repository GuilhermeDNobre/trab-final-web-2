import { Box, Container, Grid, Typography } from '@mui/material';
import { CATEGORIES, type CategoryItem } from '../../constants/categories';
import type { ProductCategory } from '../../types/Product';
import { CategoryCard } from './CategoryCard';

interface CategoriesSectionProps {
  countsByCategory?: Partial<Record<ProductCategory, number>>;
  onSelectCategory?: (categoryId: CategoryItem['id']) => void;
}

export const CategoriesSection = ({
  countsByCategory,
  onSelectCategory,
}: CategoriesSectionProps) => (
  <Box
    id="categorias"
    sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.default' }}
  >
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        sx={{ mb: { xs: 4, md: 5 }, textAlign: 'center' }}
      >
        Compre por Categoria
      </Typography>

      <Grid container spacing={3}>
        {CATEGORIES.map((category) => (
          <Grid key={category.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <CategoryCard
              category={category}
              productCount={countsByCategory?.[category.id]}
              onSelect={onSelectCategory}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);
