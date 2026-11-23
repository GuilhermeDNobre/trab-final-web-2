import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  clearAuthToken,
  loadAuthToken,
  saveAuthToken,
  type LoginFormValues,
} from '../utils/auth';
import { AuthContext, type AuthContextValue } from './authContextValue';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => loadAuthToken());

  const login = async (credentials: LoginFormValues): Promise<void> => {
    // TODO: Substituir pela chamada real POST /auth/login quando o backend estiver disponível
    const sessionToken = `mock-jwt-${btoa(credentials.email.trim())}-${Date.now()}`;
    saveAuthToken(sessionToken);
    setToken(sessionToken);
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
