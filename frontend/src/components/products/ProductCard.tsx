import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import fallbackImage from '../../assets/images/pexels-thu-huynh-639083784-17541188 1.png';
import type { Product } from '../../types/Product';
import { formatPriceBRL } from '../../utils/products';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => (
  <Card
    elevation={1}
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 2.5,
      border: 1,
      borderColor: 'divider',
    }}
  >
    <Box sx={{ position: 'relative' }}>
      <CardMedia
        component="img"
        height={180}
        image={product.imageUrl || fallbackImage}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
    </Box>

    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 42,
        }}
      >
        {product.name}
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
        {formatPriceBRL(product.price)}
      </Typography>
    </CardContent>

    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
      <Button
        variant="contained"
        fullWidth
        size="small"
        startIcon={<ShoppingCartOutlinedIcon />}
        onClick={() => onAddToCart?.(product)}
        sx={{ borderRadius: 1.5 }}
      >
        Adicionar
      </Button>
    </CardActions>
  </Card>
);
