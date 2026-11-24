import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RemoveShoppingCartOutlinedIcon from '@mui/icons-material/RemoveShoppingCartOutlined';
import { AdminLayout } from '../components/admin/AdminLayout';
import { CategoryDistributionCard } from '../components/admin/CategoryDistributionCard';
import { KpiCard } from '../components/admin/KpiCard';
import { RecentProductsCard } from '../components/admin/RecentProductsCard';
import { STORE_INFO } from '../constants/store';
import { getApiErrorMessage } from '../services/api';
import { listAdminProducts } from '../services/productsService';
import type { Product } from '../types/Product';
import {
  computeCatalogMetrics,
  getCategoryDistribution,
  getRecentProducts,
} from '../utils/adminMetrics';
import { formatPriceBRL, normalizeSearchText } from '../utils/products';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await listAdminProducts();
        if (isMounted) {
          setProducts(data);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            getApiErrorMessage(
              error,
              'Não foi possível carregar os dados do catálogo.',
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [reloadCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    setReloadCount((prev) => prev + 1);
  };

  const filteredProducts = useMemo(() => {
    const normalized = normalizeSearchText(searchTerm);
    if (!normalized) return products;
    return products.filter((product) =>
      normalizeSearchText(product.name).includes(normalized),
    );
  }, [products, searchTerm]);

  const metrics = useMemo(() => computeCatalogMetrics(products), [products]);

  const categoryDistribution = useMemo(
    () => getCategoryDistribution(products),
    [products],
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

        {isLoading && <LinearProgress />}

        {loadError && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleRetry}
              >
                Tentar novamente
              </Button>
            }
          >
            {loadError}
          </Alert>
        )}

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
              title="Esgotados"
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
