import { createContext } from 'react';
import type { LoginFormValues } from '../utils/auth';

export interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginFormValues) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
