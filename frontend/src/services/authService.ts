import { api } from './api';
import type { LoginFormValues } from '../utils/auth';

export interface AdminUser {
  id: string;
  email: string;
}

export const loginAdmin = async (
  credentials: LoginFormValues,
): Promise<{ token: string }> => {
  const { data } = await api.post<{ token: string }>('/auth/login', {
    email: credentials.email.trim(),
    password: credentials.password,
  });
  return data;
};

export const getCurrentAdmin = async (): Promise<AdminUser> => {
  const { data } = await api.get<AdminUser>('/auth/me');
  return data;
};
