import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import type { Product } from '../../types/Product';
import { getCategoryLabel } from '../../utils/adminMetrics';
import { formatShortDate } from '../../utils/adminProducts';
import type { AdminSortField, SortOrder } from '../../utils/adminProducts';
import { formatPriceBRL } from '../../utils/products';

interface AdminProductsTableProps {
  products: readonly Product[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  sortField: AdminSortField;
  sortOrder: SortOrder;
  onSortChange: (field: AdminSortField) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

interface SortableColumn {
  id: AdminSortField;
  label: string;
  align?: 'left' | 'right';
}

const COLUMNS: readonly SortableColumn[] = [
  { id: 'name', label: 'Produto' },
  { id: 'category', label: 'Categoria' },
  { id: 'price', label: 'Preço', align: 'right' },
  { id: 'status', label: 'Status' },
  { id: 'updatedAt', label: 'Atualizado em' },
];

export const AdminProductsTable = ({
  products,
  totalCount,
  page,
  rowsPerPage,
  sortField,
  sortOrder,
  onSortChange,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}: AdminProductsTableProps) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 2,
      bgcolor: 'background.paper',
      overflow: 'hidden',
    }}
  >
    <TableContainer>
      <Table sx={{ minWidth: 680 }} aria-label="Tabela de produtos">
        <TableHead>
          <TableRow sx={{ bgcolor: '#F8F9FA' }}>
            {COLUMNS.map((column) => (
              <TableCell
                key={column.id}
                align={column.align ?? 'left'}
                sortDirection={sortField === column.id ? sortOrder : false}
                sx={{ fontWeight: 700 }}
              >
                <TableSortLabel
                  active={sortField === column.id}
                  direction={sortField === column.id ? sortOrder : 'asc'}
                  onClick={() => onSortChange(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Ações
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum produto encontrado com os filtros selecionados.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const isAvailable = product.status === 'disponivel';

              return (
                <TableRow key={product._id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Avatar
                        variant="rounded"
                        src={product.imageUrl}
                        alt={product.name}
                        sx={{ width: 40, height: 40, bgcolor: 'action.hover' }}
                      >
                        <Inventory2OutlinedIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {getCategoryLabel(product.category)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatPriceBRL(product.price)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={isAvailable ? 'Disponível' : 'Indisponível'}
                      size="small"
                      color={isAvailable ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatShortDate(product.updatedAt)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ justifyContent: 'flex-end' }}
                    >
                      <Tooltip title={onEdit ? 'Editar produto' : 'Edição em breve'}>
                        <span>
                          <IconButton
                            size="small"
                            aria-label={`Editar ${product.name}`}
                            disabled={!onEdit}
                            onClick={() => onEdit?.(product)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title={onDelete ? 'Excluir produto' : 'Exclusão em breve'}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Excluir ${product.name}`}
                            disabled={!onDelete}
                            onClick={() => onDelete?.(product)}
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>

    <TablePagination
      component="div"
      count={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[5, 10, 25]}
      onPageChange={(_, newPage) => onPageChange(newPage)}
      onRowsPerPageChange={(event) =>
        onRowsPerPageChange(Number.parseInt(event.target.value, 10))
      }
      labelRowsPerPage="Itens por página:"
      labelDisplayedRows={({ from, to, count }) =>
        `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
      }
    />
  </Paper>
);
