import { Button, Chip, Stack, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { CATEGORIES } from '../../constants/categories';
import type { ProductCategory } from '../../types/Product';

interface ActiveFiltersBarProps {
  totalResults: number;
  searchTerm: string;
  selectedCategories: ProductCategory[];
  onClearSearch: () => void;
  onRemoveCategory: (category: ProductCategory) => void;
  onOpenMobileFilters: () => void;
}

const getCategoryLabel = (id: ProductCategory): string =>
  CATEGORIES.find((cat) => cat.id === id)?.label ?? id;

export const ActiveFiltersBar = ({
  totalResults,
  searchTerm,
  selectedCategories,
  onClearSearch,
  onRemoveCategory,
  onOpenMobileFilters,
}: ActiveFiltersBarProps) => {
  const trimmedSearch = searchTerm.trim();

  return (
    <Stack spacing={1.5} sx={{ mb: 2.5 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Exibindo <strong>{totalResults}</strong>{' '}
          {totalResults === 1 ? 'resultado' : 'resultados'}
          {trimmedSearch ? ` para "${trimmedSearch}"` : ''}
        </Typography>

        <Button
          variant="outlined"
          size="small"
          color="inherit"
          startIcon={<TuneIcon />}
          onClick={onOpenMobileFilters}
          sx={{ display: { md: 'none' }, borderColor: 'divider' }}
        >
          Filtros
        </Button>
      </Stack>

      {(trimmedSearch || selectedCategories.length > 0) && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {selectedCategories.map((categoryId) => (
            <Chip
              key={categoryId}
              size="small"
              color="primary"
              label={getCategoryLabel(categoryId)}
              onDelete={() => onRemoveCategory(categoryId)}
            />
          ))}

          {trimmedSearch && (
            <Chip
              size="small"
              label={`Busca: ${trimmedSearch}`}
              onDelete={onClearSearch}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
};
