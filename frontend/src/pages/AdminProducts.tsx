import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Snackbar, Stack, Typography } from '@mui/material';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminProductsTable } from '../components/admin/AdminProductsTable';
import { AdminProductsToolbar } from '../components/admin/AdminProductsToolbar';
import { DeleteProductDialog } from '../components/admin/DeleteProductDialog';
import { ProductFormDialog } from '../components/admin/ProductFormDialog';
import { getApiErrorMessage } from '../services/api';
import {
  createAdminProduct,
  deleteAdminProduct,
  listAdminProducts,
  updateAdminProduct,
  updateAdminProductStatus,
  uploadProductImage,
} from '../services/productsService';
import type { Product, ProductCategory, ProductStatus } from '../types/Product';
import { filterAndSortAdminProducts } from '../utils/adminProducts';
import type { AdminSortField, SortOrder } from '../utils/adminProducts';
import type { ProductPayload } from '../utils/productForm';

interface SnackbarState {
  message: string;
  severity: 'success' | 'error';
}

export const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [formOpen, setFormOpen] = useState(
    () => searchParams.get('novo') === '1',
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [status, setStatus] = useState<ProductStatus | 'all'>('all');
  const [sortField, setSortField] = useState<AdminSortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
            getApiErrorMessage(error, 'Não foi possível carregar os produtos.'),
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
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormError(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
    setFormError(null);
    if (searchParams.has('novo')) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSubmitProduct = async (payload: ProductPayload) => {
    setIsSaving(true);
    setFormError(null);

    try {
      let resolvedImageUrl = payload.imageUrl;

      if (payload.imageFile) {
        const uploaded = await uploadProductImage(payload.imageFile);
        resolvedImageUrl = uploaded.imageUrl;
      }

      if (editingProduct) {
        const updated = await updateAdminProduct(editingProduct._id, {
          name: payload.name,
          price: payload.price,
          category: payload.category,
          status: payload.status,
          imageUrl: resolvedImageUrl,
          description: payload.description,
        });
        setProducts((prev) =>
          prev.map((item) => (item._id === updated._id ? updated : item)),
        );
        setSnackbar({
          message: `Produto "${updated.name}" atualizado com sucesso!`,
          severity: 'success',
        });
      } else {
        const created = await createAdminProduct({
          name: payload.name,
          price: payload.price,
          category: payload.category,
          status: payload.status,
          ...(resolvedImageUrl ? { imageUrl: resolvedImageUrl } : {}),
          ...(payload.description ? { description: payload.description } : {}),
        });
        setProducts((prev) => [created, ...prev]);
        setPage(0);
        setSnackbar({
          message: `Produto "${created.name}" cadastrado com sucesso!`,
          severity: 'success',
        });
      }

      handleCloseForm();
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          'Não foi possível salvar o produto. Verifique os dados e tente novamente.',
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus: ProductStatus =
      product.status === 'available' ? 'out-of-stock' : 'available';

    setUpdatingStatusId(product._id);
    try {
      const updated = await updateAdminProductStatus(product._id, nextStatus);
      setProducts((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );
      setSnackbar({
        message: `"${updated.name}" marcado como ${
          updated.status === 'available' ? 'Disponível' : 'Esgotado'
        }.`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        message: getApiErrorMessage(
          error,
          'Não foi possível alterar o status do produto.',
        ),
        severity: 'error',
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleRequestDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleCloseDelete = () => {
    setDeletingProduct(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      await deleteAdminProduct(deletingProduct._id);
      setProducts((prev) =>
        prev.filter((item) => item._id !== deletingProduct._id),
      );
      setSnackbar({
        message: `Produto "${deletingProduct.name}" excluído com sucesso!`,
        severity: 'success',
      });
      setDeletingProduct(null);
    } catch (error) {
      setSnackbar({
        message: getApiErrorMessage(error, 'Não foi possível excluir o produto.'),
        severity: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
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
          isLoading={isLoading}
          updatingStatusId={updatingStatusId}
          onSortChange={handleSortChange}
          onPageChange={setPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          onToggleStatus={(product) => void handleToggleStatus(product)}
          onEdit={handleOpenEdit}
          onDelete={handleRequestDelete}
        />
      </Stack>

      <ProductFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitProduct}
        initialProduct={editingProduct}
        isSubmitting={isSaving}
        submitError={formError}
      />

      <DeleteProductDialog
        product={deletingProduct}
        isDeleting={isDeleting}
        onClose={handleCloseDelete}
        onConfirm={() => void handleConfirmDelete()}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(null)}
          severity={snackbar?.severity ?? 'success'}
          variant="filled"
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};
