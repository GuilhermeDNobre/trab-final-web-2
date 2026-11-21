import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { STORE_INFO } from '../../constants/store';
import { useCart } from '../../hooks/useCart';
import { buildWhatsAppOrderUrl } from '../../utils/cart';
import { formatPriceBRL } from '../../utils/products';
import { CartItemRow } from './CartItemRow';

export const CartDrawer = () => {
  const {
    items,
    totalPrice,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const whatsappUrl = buildWhatsAppOrderUrl(STORE_INFO.whatsappUrl, items);

  return (
    <Drawer anchor="right" open={isOpen} onClose={closeCart}>
      <Box
        sx={{
          width: { xs: '100vw', sm: 400 },
          maxWidth: '100vw',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ShoppingCartOutlinedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Seu Carrinho
            </Typography>
          </Stack>

          <IconButton aria-label="Fechar carrinho" onClick={closeCart}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2.5 }}>
          {items.length === 0 ? (
            <Stack
              spacing={1.5}
              sx={{
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                py: 6,
              }}
            >
              <ShoppingCartOutlinedIcon
                sx={{ fontSize: 48, color: 'text.disabled' }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Seu carrinho está vazio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adicione produtos do catálogo para montar seu pedido.
              </Typography>
            </Stack>
          ) : (
            <Stack divider={<Divider />}>
              {items.map((item) => (
                <CartItemRow
                  key={item.product._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </Stack>
          )}
        </Box>

        {items.length > 0 && (
          <Box
            sx={{
              p: 2.5,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'grey.50',
            }}
          >
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', mb: 2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatPriceBRL(totalPrice)}
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<WhatsAppIcon />}
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderRadius: 2 }}
              >
                Finalizar Pedido no WhatsApp
              </Button>

              <Button
                variant="text"
                size="small"
                color="inherit"
                onClick={clearCart}
              >
                Limpar carrinho
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
