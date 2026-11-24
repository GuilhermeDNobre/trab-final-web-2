import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { setUnauthorizedHandler } from '../services/api';
import {
  getCurrentAdmin,
  loginAdmin,
  type AdminUser,
} from '../services/authService';
import {
  clearAuthToken,
  loadAuthToken,
  saveAuthToken,
  type LoginFormValues,
} from '../utils/auth';
import { AuthContext, type AuthContextValue } from './authContextValue';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => loadAuthToken());
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(loadAuthToken()),
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setToken(null);
    setAdmin(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  useEffect(() => {
    if (!token || admin) return;

    let isMounted = true;

    const verifySession = async () => {
      try {
        const profile = await getCurrentAdmin();
        if (isMounted) {
          setAdmin(profile);
        }
      } catch {
        if (isMounted) {
          clearAuthToken();
          setToken(null);
          setAdmin(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void verifySession();

    return () => {
      isMounted = false;
    };
  }, [token, admin]);

  const login = useCallback(async (credentials: LoginFormValues): Promise<void> => {
    const { token: accessToken } = await loginAdmin(credentials);
    saveAuthToken(accessToken);

    try {
      const profile = await getCurrentAdmin();
      setToken(accessToken);
      setAdmin(profile);
      setIsLoading(false);
    } catch (error) {
      clearAuthToken();
      setToken(null);
      setAdmin(null);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      admin,
      isAuthenticated: Boolean(token && admin),
      isLoading,
      login,
      logout,
    }),
    [token, admin, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
