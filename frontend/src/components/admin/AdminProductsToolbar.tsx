import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { CATEGORIES } from '../../constants/categories';
import type { ProductCategory, ProductStatus } from '../../types/Product';

interface AdminProductsToolbarProps {
  category: ProductCategory | 'all';
  status: ProductStatus | 'all';
  totalCount: number;
  hasActiveFilters: boolean;
  onCategoryChange: (category: ProductCategory | 'all') => void;
  onStatusChange: (status: ProductStatus | 'all') => void;
  onClearFilters: () => void;
}

export const AdminProductsToolbar = ({
  category,
  status,
  totalCount,
  hasActiveFilters,
  onCategoryChange,
  onStatusChange,
  onClearFilters,
}: AdminProductsToolbarProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: 'background.paper',
    }}
  >
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="admin-filter-category-label">Categoria</InputLabel>
          <Select
            labelId="admin-filter-category-label"
            label="Categoria"
            value={category}
            onChange={(event) =>
              onCategoryChange(event.target.value as ProductCategory | 'all')
            }
          >
            <MenuItem value="all">Todas as categorias</MenuItem>
            {CATEGORIES.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="admin-filter-status-label">Status</InputLabel>
          <Select
            labelId="admin-filter-status-label"
            label="Status"
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as ProductStatus | 'all')
            }
          >
            <MenuItem value="all">Todos os status</MenuItem>
            <MenuItem value="disponivel">Disponível</MenuItem>
            <MenuItem value="indisponivel">Indisponível</MenuItem>
          </Select>
        </FormControl>

        {hasActiveFilters && (
          <Button
            variant="text"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={onClearFilters}
          >
            Limpar filtros
          </Button>
        )}
      </Stack>

      <Typography variant="body2" color="text.secondary">
        {totalCount} {totalCount === 1 ? 'produto' : 'produtos'}
      </Typography>
    </Stack>
  </Paper>
);
