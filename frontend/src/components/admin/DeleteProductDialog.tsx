import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { Product } from '../../types/Product';

interface DeleteProductDialogProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteProductDialog = ({
  product,
  onClose,
  onConfirm,
}: DeleteProductDialogProps) => (
  <Dialog
    open={Boolean(product)}
    onClose={onClose}
    fullWidth
    maxWidth="xs"
    aria-labelledby="delete-product-dialog-title"
  >
    <DialogTitle id="delete-product-dialog-title" sx={{ fontWeight: 700 }}>
      Excluir produto
    </DialogTitle>

    <DialogContent>
      <DialogContentText>
        Tem certeza que deseja excluir{' '}
        <strong>{product?.name ?? ''}</strong>? Essa ação não poderá ser
        desfeita.
      </DialogContentText>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} color="inherit">
        Cancelar
      </Button>
      <Button onClick={onConfirm} variant="contained" color="error">
        Excluir
      </Button>
    </DialogActions>
  </Dialog>
);
