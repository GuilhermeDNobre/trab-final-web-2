import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { STORE_INFO } from '../constants/store';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../services/api';
import {
  hasLoginFormErrors,
  validateLoginForm,
  type LoginFormErrors,
  type LoginFormValues,
} from '../utils/auth';

interface LocationState {
  from?: { pathname?: string };
}

export const AdminLogin = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? '/admin';

  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const updateField = <K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateLoginForm(values);

    if (hasLoginFormErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await login(values);
      void navigate(redirectTo, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setSubmitError('E-mail ou senha inválidos.');
      } else {
        setSubmitError(
          getApiErrorMessage(
            error,
            'Não foi possível entrar. Verifique suas credenciais.',
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8F9FA',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockOutlinedIcon />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {STORE_INFO.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Acesso Administrativo
              </Typography>
            </Stack>

            {submitError && <Alert severity="error">{submitError}</Alert>}

            <form onSubmit={(event) => void handleSubmit(event)} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="E-mail"
                  type="email"
                  placeholder="admin@geanbebidas.com"
                  value={values.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  required
                  fullWidth
                  autoFocus
                  autoComplete="email"
                />

                <TextField
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={(event) =>
                    updateField('password', event.target.value)
                  }
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  required
                  fullWidth
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword ? 'Ocultar senha' : 'Mostrar senha'
                            }
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? (
                              <VisibilityOffOutlinedIcon fontSize="small" />
                            ) : (
                              <VisibilityOutlinedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </Stack>
            </form>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component={RouterLink}
                to="/"
                variant="body2"
                underline="hover"
                color="text.secondary"
              >
                Voltar para a vitrine
              </Link>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
