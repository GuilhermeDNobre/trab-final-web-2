export const AUTH_TOKEN_STORAGE_KEY = 'gean_bebidas_admin_token';

export interface LoginFormValues {
  email: string;
  password: string;
}

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

export const loadAuthToken = (): string | null => {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const saveAuthToken = (token: string): void => {
  try {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage quota / privacy mode errors
  }
};

export const clearAuthToken = (): void => {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLoginForm = (values: LoginFormValues): LoginFormErrors => {
  const errors: LoginFormErrors = {};
  const trimmedEmail = values.email.trim();

  if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!values.password) {
    errors.password = 'Informe sua senha.';
  }

  return errors;
};

export const hasLoginFormErrors = (errors: LoginFormErrors): boolean =>
  Object.keys(errors).length > 0;
