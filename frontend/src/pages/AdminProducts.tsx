import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Snackbar, Stack, Typography } from '@mui/material';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminProductsTable } from '../components/admin/AdminProductsTable';
import { AdminProductsToolbar } from '../components/admin/AdminProductsToolbar';
import { ProductFormDialog } from '../components/admin/ProductFormDialog';
import { MOCK_PRODUCTS } from '../constants/mockProducts';
import type { Product, ProductCategory, ProductStatus } from '../types/Product';
import { filterAndSortAdminProducts } from '../utils/adminProducts';
import type { AdminSortField, SortOrder } from '../utils/adminProducts';
import type { ProductPayload } from '../utils/productForm';

export const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(() => [...MOCK_PRODUCTS]);
  const [formOpen, setFormOpen] = useState(
    () => searchParams.get('novo') === '1',
  );
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [status, setStatus] = useState<ProductStatus | 'all'>('all');
  const [sortField, setSortField] = useState<AdminSortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredProducts = useMemo(
    () =>
      filterAndSortAdminProducts(products, {
        searchTerm,
        category,
        status,
        sortField,
        sortOrder,
      }),
    [products, searchTerm, category, status, sortField, sortOrder],
  );

  const paginatedProducts = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, page, rowsPerPage]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || category !== 'all' || status !== 'all';

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleCategoryChange = (value: ProductCategory | 'all') => {
    setCategory(value);
    setPage(0);
  };

  const handleStatusChange = (value: ProductStatus | 'all') => {
    setStatus(value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setStatus('all');
    setPage(0);
  };

  const handleSortChange = (field: AdminSortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(0);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    if (searchParams.has('novo')) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleCreateProduct = (payload: ProductPayload) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      _id: `local-${Date.now()}`,
      name: payload.name,
      price: payload.price,
      category: payload.category,
      status: payload.status,
      ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
      ...(payload.description ? { description: payload.description } : {}),
      createdAt: now,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);
    handleCloseForm();
    setPage(0);
    setSnackbarMessage(`Produto "${payload.name}" cadastrado com sucesso!`);
  };

  return (
    <AdminLayout
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      onNewProductClick={() => setFormOpen(true)}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Produtos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Consulte e filtre todos os itens cadastrados no catálogo.
          </Typography>
        </Box>

        <AdminProductsToolbar
          category={category}
          status={status}
          totalCount={filteredProducts.length}
          hasActiveFilters={hasActiveFilters}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          onClearFilters={handleClearFilters}
        />

        <AdminProductsTable
          products={paginatedProducts}
          totalCount={filteredProducts.length}
          page={page}
          rowsPerPage={rowsPerPage}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onPageChange={setPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Stack>

      <ProductFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateProduct}
      />

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity="success"
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};
