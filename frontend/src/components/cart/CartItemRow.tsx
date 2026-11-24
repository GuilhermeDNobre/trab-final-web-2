import { Box, IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import fallbackImage from '../../assets/images/pexels-thu-huynh-639083784-17541188 1.png';
import type { CartItem } from '../../types/Cart';
import { formatPriceBRL } from '../../utils/products';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItemRow = ({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) => {
  const { product, quantity } = item;

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 1.5 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 1.5,
          overflow: 'hidden',
          flexShrink: 0,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <img
          src={product.imageUrl || fallbackImage}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
          {product.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatPriceBRL(product.price)} cada
        </Typography>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', mt: 0.5 }}
        >
          <IconButton
            size="small"
            aria-label="Diminuir quantidade"
            onClick={() => onUpdateQuantity(product._id, quantity - 1)}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="body2"
            sx={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}
          >
            {quantity}
          </Typography>

          <IconButton
            size="small"
            aria-label="Aumentar quantidade"
            onClick={() => onUpdateQuantity(product._id, quantity + 1)}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Stack sx={{ alignItems: 'flex-end', flexShrink: 0 }} spacing={0.5}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {formatPriceBRL(product.price * quantity)}
        </Typography>
        <IconButton
          size="small"
          color="error"
          aria-label="Remover item"
          onClick={() => onRemove(product._id)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
};
