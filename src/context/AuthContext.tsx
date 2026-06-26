import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getCurrentUser } from '../lib/auth-api';

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (newToken: string, userData: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'iching_token';
const LEGACY_TOKEN_KEY = 'bazi_token';

/** 读取 token，并把旧 key bazi_token 迁移到 iching_token */
function readToken(): string | null {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) return t;
    const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacy) {
      localStorage.setItem(TOKEN_KEY, legacy);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      return legacy;
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);
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
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
        setIsInitialized(true);
      });
  }, [token]);

  const login = useCallback((newToken: string, userData: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, isLoading, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
