import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../lib/auth-api';

export interface AuthUser {
  id: string;
  email: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('bazi_token');
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsInitialized(true);
      return;
    }
    setIsLoading(true);
    getCurrentUser(token)
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          // Token 无效，清除
          localStorage.removeItem('bazi_token');
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('bazi_token');
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
        setIsInitialized(true);
      });
  }, [token]);

  const login = useCallback((newToken: string, userData: AuthUser) => {
    localStorage.setItem('bazi_token', newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bazi_token');
    setToken(null);
    setUser(null);
  }, []);

  const isLoggedIn = !!user;

  return { user, token, isLoggedIn, isLoading, isInitialized, login, logout };
}
