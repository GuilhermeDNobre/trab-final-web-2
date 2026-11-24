import axios from 'axios';
import { clearAuthToken, loadAuthToken } from '../utils/auth';

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = loadAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';
      if (!requestUrl.includes('/auth/login')) {
        clearAuthToken();
        unauthorizedHandler?.();
      }
    }
    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return 'Não foi possível conectar ao servidor. Verifique se a API está ativa.';
  }

  const status = error.response.status;
  if (status === 401) {
    return 'Sua sessão expirou. Faça login novamente.';
  }
  if (status === 413) {
    return 'A imagem excede o limite máximo de 5 MB.';
  }
  if (status === 429) {
    return 'Muitas tentativas em sequência. Aguarde um momento e tente novamente.';
  }
  if (status === 503) {
    return 'Serviço temporariamente indisponível. Tente novamente em instantes.';
  }

  return fallback;
};
