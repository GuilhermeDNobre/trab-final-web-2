import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Stack, Typography } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RemoveShoppingCartOutlinedIcon from '@mui/icons-material/RemoveShoppingCartOutlined';
import { AdminLayout } from '../components/admin/AdminLayout';
import { CategoryDistributionCard } from '../components/admin/CategoryDistributionCard';
import { KpiCard } from '../components/admin/KpiCard';
import { RecentProductsCard } from '../components/admin/RecentProductsCard';
import { MOCK_PRODUCTS } from '../constants/mockProducts';
import { STORE_INFO } from '../constants/store';
import {
  computeCatalogMetrics,
  getCategoryDistribution,
  getRecentProducts,
} from '../utils/adminMetrics';
import { formatPriceBRL } from '../utils/products';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter((product) =>
      product.name.toLowerCase().includes(normalized),
    );
  }, [searchTerm]);

  const metrics = useMemo(
    () => computeCatalogMetrics(MOCK_PRODUCTS),
    [],
  );

  const categoryDistribution = useMemo(
    () => getCategoryDistribution(MOCK_PRODUCTS),
    [],
  );

  const recentProducts = useMemo(
    () => getRecentProducts(filteredProducts, 6),
    [filteredProducts],
  );

  return (
    <AdminLayout
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onNewProductClick={() => void navigate('/admin/produtos?novo=1')}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Olá, Administrador
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Visão geral do catálogo da {STORE_INFO.name}.
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Total de Produtos"
              value={metrics.total}
              subtitle="itens no catálogo"
              icon={<Inventory2OutlinedIcon fontSize="small" />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Disponíveis na Vitrine"
              value={metrics.availableCount}
              subtitle={`${metrics.availablePercentage}% do catálogo`}
              icon={<CheckCircleOutlinedIcon fontSize="small" />}
              accentColor="success.main"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Indisponíveis"
              value={metrics.unavailableCount}
              subtitle="itens fora da vitrine"
              icon={<RemoveShoppingCartOutlinedIcon fontSize="small" />}
              accentColor={
                metrics.unavailableCount > 0 ? 'warning.main' : 'text.secondary'
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Preço Médio"
              value={formatPriceBRL(metrics.averagePrice)}
              subtitle="média do catálogo"
              icon={<AttachMoneyIcon fontSize="small" />}
              accentColor="info.main"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentProductsCard products={recentProducts} />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <CategoryDistributionCard
              items={categoryDistribution}
              totalProducts={metrics.total}
            />
          </Grid>
        </Grid>
      </Stack>
    </AdminLayout>
  );
};
