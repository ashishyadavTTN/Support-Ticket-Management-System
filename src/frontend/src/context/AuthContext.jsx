import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  refreshSession,
  register as apiRegister,
  getCurrentUser,
} from '../api/auth';
import { setAccessTokenGetter, resetSessionExpiryGuard } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const accessTokenRef = useRef(null);

  const setToken = useCallback((token) => {
    accessTokenRef.current = token;
    setAccessToken(token);
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  const applyAuthResponse = useCallback(
    (data) => {
      resetSessionExpiryGuard();
      setToken(data.accessToken);
      setUser(data.user);
      return data.user;
    },
    [setToken]
  );

  const performRefresh = useCallback(async () => {
    const data = await refreshSession();
    return applyAuthResponse(data);
  }, [applyAuthResponse]);

  const login = useCallback(
    async (credentials) => {
      const data = await apiLogin(credentials);
      return applyAuthResponse(data);
    },
    [applyAuthResponse]
  );

  const register = useCallback(
    async (payload) => {
      const data = await apiRegister(payload);
      return applyAuthResponse(data);
    },
    [applyAuthResponse]
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Clear local session even if server logout fails
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    setAccessTokenGetter(() => accessTokenRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await performRefresh();
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [performRefresh, clearSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isInitializing,
      login,
      register,
      logout,
      refresh: performRefresh,
      performRefresh,
      clearSession,
      getCurrentUser: async () => {
        const data = await getCurrentUser();
        setUser(data.user);
        return data.user;
      },
      setUser,
    }),
    [user, accessToken, isInitializing, login, register, logout, performRefresh, clearSession, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
