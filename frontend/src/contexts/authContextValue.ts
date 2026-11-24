import { createContext } from 'react';
import type { AdminUser } from '../services/authService';
import type { LoginFormValues } from '../utils/auth';

export interface AuthContextValue {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginFormValues) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
