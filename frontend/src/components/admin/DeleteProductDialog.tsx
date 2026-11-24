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
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteProductDialog = ({
  product,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteProductDialogProps) => (
  <Dialog
    open={Boolean(product)}
    onClose={isDeleting ? undefined : onClose}
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
      <Button onClick={onClose} color="inherit" disabled={isDeleting}>
        Cancelar
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        disabled={isDeleting}
      >
        {isDeleting ? 'Excluindo...' : 'Excluir'}
      </Button>
    </DialogActions>
  </Dialog>
);
