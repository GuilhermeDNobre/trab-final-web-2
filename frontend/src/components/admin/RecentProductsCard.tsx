import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import type { Product } from '../../types/Product';
import { getCategoryLabel } from '../../utils/adminMetrics';
import { formatPriceBRL } from '../../utils/products';

interface RecentProductsCardProps {
  products: readonly Product[];
}

export const RecentProductsCard = ({ products }: RecentProductsCardProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2.5,
      height: '100%',
      borderRadius: 2,
      bgcolor: 'background.paper',
    }}
  >
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Atualizados recentemente
      </Typography>
      <Button
        component={RouterLink}
        to="/admin/produtos"
        size="small"
        endIcon={<ChevronRightIcon />}
      >
        Ver todos
      </Button>
    </Stack>

    {products.length === 0 ? (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Nenhum produto encontrado para a busca informada.
        </Typography>
      </Box>
    ) : (
      <List disablePadding>
        {products.map((product, index) => {
          const isAvailable = product.status === 'available';

          return (
            <Box key={product._id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                disableGutters
                sx={{
                  py: 1.5,
                  gap: 1,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={product.imageUrl}
                    alt={product.name}
                    sx={{ width: 44, height: 44, bgcolor: 'action.hover' }}
                  >
                    <Inventory2OutlinedIcon fontSize="small" />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={product.name}
                  secondary={getCategoryLabel(product.category)}
                  slotProps={{
                    primary: {
                      variant: 'body2',
                      noWrap: true,
                      sx: { fontWeight: 600 },
                    },
                    secondary: {
                      variant: 'caption',
                      color: 'text.secondary',
                    },
                  }}
                  sx={{ minWidth: 0, flexGrow: 1 }}
                />

                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', ml: 'auto' }}
                >
                  <Chip
                    label={isAvailable ? 'Disponível' : 'Esgotado'}
                    size="small"
                    color={isAvailable ? 'success' : 'default'}
                    variant="outlined"
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, minWidth: 76, textAlign: 'right' }}
                  >
                    {formatPriceBRL(product.price)}
                  </Typography>
                </Stack>
              </ListItem>
            </Box>
          );
        })}
      </List>
    )}
  </Paper>
);
