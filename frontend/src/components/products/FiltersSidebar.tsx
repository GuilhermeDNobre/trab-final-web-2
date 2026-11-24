import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CATEGORIES } from '../../constants/categories';
import type { ProductCategory } from '../../types/Product';
import type { SortOption } from '../../utils/products';

interface FiltersSidebarProps {
  selectedCategories: ProductCategory[];
  priceRange: [number, number];
  sortBy: SortOption;
  onToggleCategory: (category: ProductCategory) => void;
  onChangePriceRange: (range: [number, number]) => void;
  onChangeSort: (sort: SortOption) => void;
  onResetFilters: () => void;
}

const SORT_OPTIONS: readonly { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'name-asc', label: 'Nome (A-Z)' },
];

export const FiltersSidebar = ({
  selectedCategories,
  priceRange,
  sortBy,
  onToggleCategory,
  onChangePriceRange,
  onChangeSort,
  onResetFilters,
}: FiltersSidebarProps) => {
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 300 ||
    sortBy !== 'relevance';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2.5,
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TuneIcon fontSize="small" color="action" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Filtros
          </Typography>
        </Stack>

        {hasActiveFilters && (
          <Button size="small" onClick={onResetFilters} sx={{ px: 1 }}>
            Limpar
          </Button>
        )}
      </Stack>

      <Divider sx={{ mb: 1 }} />

      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Categorias
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <FormGroup>
            {CATEGORIES.map((category) => (
              <FormControlLabel
                key={category.id}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => onToggleCategory(category.id)}
                  />
                }
                label={
                  <Typography variant="body2">{category.label}</Typography>
                }
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      <Divider />

      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Faixa de Preço
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Typography variant="caption" color="text.secondary">
            R$ {priceRange[0]} até{' '}
            {priceRange[1] >= 300 ? 'R$ 300+' : `R$ ${priceRange[1]}`}
          </Typography>
          <Slider
            size="small"
            value={priceRange}
            min={0}
            max={300}
            step={5}
            onChange={(_, newValue) => {
              if (Array.isArray(newValue) && newValue.length === 2) {
                onChangePriceRange([newValue[0], newValue[1]]);
              }
            }}
            valueLabelDisplay="auto"
          />
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', color: 'text.secondary' }}
          >
            <Typography variant="caption">R$ 0</Typography>
            <Typography variant="caption">R$ 300+</Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Divider />

      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Ordenar por
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <FormControl fullWidth size="small">
            <Select
              value={sortBy}
              onChange={(event) => onChangeSort(event.target.value as SortOption)}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};
