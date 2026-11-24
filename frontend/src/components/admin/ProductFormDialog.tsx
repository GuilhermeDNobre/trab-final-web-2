import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { CATEGORIES } from '../../constants/categories';
import type { Product, ProductCategory, ProductStatus } from '../../types/Product';
import {
  getInitialFormValues,
  hasProductFormErrors,
  toProductPayload,
  validateImageFile,
  validateProductForm,
} from '../../utils/productForm';
import type {
  ProductFormErrors,
  ProductFormValues,
  ProductPayload,
} from '../../utils/productForm';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ProductPayload) => void;
  initialProduct?: Product | null;
}

interface ProductFormBodyProps {
  onClose: () => void;
  onSubmit: (payload: ProductPayload) => void;
  initialProduct: Product | null;
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.readAsDataURL(file);
  });

const ProductFormBody = ({
  onClose,
  onSubmit,
  initialProduct,
}: ProductFormBodyProps) => {
  const [values, setValues] = useState<ProductFormValues>(() =>
    getInitialFormValues(initialProduct),
  );
  const [errors, setErrors] = useState<ProductFormErrors>({});

  const isEditing = Boolean(initialProduct);

  const updateField = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const fileError = validateImageFile(file);
    if (fileError) {
      setErrors((prev) => ({ ...prev, imageFile: fileError }));
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);
      setValues((prev) => ({
        ...prev,
        imageFile: file,
        imagePreviewUrl: previewUrl,
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.imageFile;
        return next;
      });
    } catch {
      setErrors((prev) => ({
        ...prev,
        imageFile: 'Não foi possível carregar a imagem selecionada.',
      }));
    }
  };

  const handleRemoveImage = () => {
    setValues((prev) => ({
      ...prev,
      imageFile: null,
      imagePreviewUrl: '',
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.imageFile;
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateProductForm(values);

    if (hasProductFormErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(toProductPayload(values));
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? 'Editar Produto' : 'Novo Produto'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField
            label="Nome do produto"
            placeholder="Ex.: Cerveja Heineken Long Neck 330ml"
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            autoFocus
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Preço"
                type="number"
                placeholder="0.00"
                value={values.price}
                onChange={(event) => updateField('price', event.target.value)}
                error={Boolean(errors.price)}
                helperText={errors.price}
                required
                fullWidth
                slotProps={{
                  htmlInput: { min: 0, step: '0.01' },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required>
                <InputLabel id="product-form-category-label">
                  Categoria
                </InputLabel>
                <Select
                  labelId="product-form-category-label"
                  label="Categoria"
                  value={values.category}
                  onChange={(event) =>
                    updateField('category', event.target.value as ProductCategory)
                  }
                >
                  {CATEGORIES.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required>
                <InputLabel id="product-form-status-label">Status</InputLabel>
                <Select
                  labelId="product-form-status-label"
                  label="Status"
                  value={values.status}
                  onChange={(event) =>
                    updateField('status', event.target.value as ProductStatus)
                  }
                >
                  <MenuItem value="disponivel">Disponível</MenuItem>
                  <MenuItem value="indisponivel">Indisponível</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Imagem do produto (opcional)
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                alignItems: { sm: 'center' },
                p: 2,
                border: 1,
                borderColor: errors.imageFile ? 'error.main' : 'divider',
                borderRadius: 2,
                bgcolor: '#F8F9FA',
              }}
            >
              <Avatar
                variant="rounded"
                src={values.imagePreviewUrl || undefined}
                alt="Pré-visualização do produto"
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  flexShrink: 0,
                }}
              >
                <Inventory2OutlinedIcon color="action" />
              </Avatar>

              <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                  {values.imageFile
                    ? values.imageFile.name
                    : values.imagePreviewUrl
                      ? 'Imagem atual selecionada'
                      : 'Nenhuma imagem selecionada'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Formatos de imagem (PNG, JPG, WEBP) até 5 MB.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUploadOutlinedIcon />}
                >
                  {values.imagePreviewUrl ? 'Alterar' : 'Enviar arquivo'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => void handleFileChange(event)}
                  />
                </Button>

                {values.imagePreviewUrl && (
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    startIcon={<DeleteOutlinedIcon />}
                    onClick={handleRemoveImage}
                  >
                    Remover
                  </Button>
                )}
              </Stack>
            </Stack>
            {errors.imageFile && (
              <FormHelperText error sx={{ mx: 1.75 }}>
                {errors.imageFile}
              </FormHelperText>
            )}
          </Box>

          <TextField
            label="Descrição (opcional)"
            placeholder="Detalhes sobre embalagem, volume ou sabor..."
            value={values.description}
            onChange={(event) => updateField('description', event.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button type="submit" variant="contained">
          {isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
        </Button>
      </DialogActions>
    </form>
  );
};

export const ProductFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialProduct = null,
}: ProductFormDialogProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    {open && (
      <ProductFormBody
        key={initialProduct?._id ?? 'new'}
        onClose={onClose}
        onSubmit={onSubmit}
        initialProduct={initialProduct}
      />
    )}
  </Dialog>
);
