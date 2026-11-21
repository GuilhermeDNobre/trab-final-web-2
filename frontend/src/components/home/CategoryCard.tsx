import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Stack,
  Typography,
} from '@mui/material';
import type { CategoryItem } from '../../constants/categories';

interface CategoryCardProps {
  category: CategoryItem;
  onSelect?: (categoryId: CategoryItem['id']) => void;
}

export const CategoryCard = ({ category, onSelect }: CategoryCardProps) => {
  const { id, label, productCount, image, Icon } = category;

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <CardActionArea onClick={() => onSelect?.(id)}>
        <CardMedia
          component="img"
          height={240}
          image={image}
          alt={label}
          sx={{ objectFit: 'cover' }}
        />

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0, 0, 0, 0.72)',
            px: 2,
            py: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'common.white',
                p: 0.875,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon fontSize="small" />
            </Box>

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ color: 'common.white', fontWeight: 600, lineHeight: 1.2 }}
              >
                {label}
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.300' }}>
                {productCount} {productCount === 1 ? 'Produto' : 'Produtos'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
};
