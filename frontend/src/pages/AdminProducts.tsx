import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Snackbar, Stack, Typography } from '@mui/material';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminProductsTable } from '../components/admin/AdminProductsTable';
import { AdminProductsToolbar } from '../components/admin/AdminProductsToolbar';
import { DeleteProductDialog } from '../components/admin/DeleteProductDialog';
import { ProductFormDialog } from '../components/admin/ProductFormDialog';
import { MOCK_PRODUCTS } from '../constants/mockProducts';
import type { Product, ProductCategory, ProductStatus } from '../types/Product';
import { filterAndSortAdminProducts } from '../utils/adminProducts';
import type { AdminSortField, SortOrder } from '../utils/adminProducts';
import {
  createProductRecord,
  updateProductRecord,
} from '../utils/productForm';
import type { ProductPayload } from '../utils/productForm';

export const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(() => [...MOCK_PRODUCTS]);
  const [formOpen, setFormOpen] = useState(
    () => searchParams.get('novo') === '1',
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
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

  const maxPage = Math.max(
    0,
    Math.ceil(filteredProducts.length / rowsPerPage) - 1,
  );
  const safePage = Math.min(page, maxPage);

  const paginatedProducts = useMemo(() => {
    const start = safePage * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, safePage, rowsPerPage]);

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

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
    if (searchParams.has('novo')) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSubmitProduct = (payload: ProductPayload) => {
    const now = new Date().toISOString();

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((item) =>
          item._id === editingProduct._id
            ? updateProductRecord(item, payload, now)
            : item,
        ),
      );
      setSnackbarMessage(`Produto "${payload.name}" atualizado com sucesso!`);
    } else {
      const newProduct = createProductRecord(payload, now);
      setProducts((prev) => [newProduct, ...prev]);
      setPage(0);
      setSnackbarMessage(`Produto "${payload.name}" cadastrado com sucesso!`);
    }

    handleCloseForm();
  };

  const handleRequestDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleCloseDelete = () => {
    setDeletingProduct(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;

    setProducts((prev) =>
      prev.filter((item) => item._id !== deletingProduct._id),
    );
    setSnackbarMessage(`Produto "${deletingProduct.name}" excluído com sucesso!`);
    setDeletingProduct(null);
  };

  return (
    <AdminLayout
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      onNewProductClick={handleOpenCreate}
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
          page={safePage}
          rowsPerPage={rowsPerPage}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onPageChange={setPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleOpenEdit}
          onDelete={handleRequestDelete}
        />
      </Stack>

      <ProductFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitProduct}
        initialProduct={editingProduct}
      />

      <DeleteProductDialog
        product={deletingProduct}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
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
