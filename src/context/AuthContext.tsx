import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getCurrentUser, type QuotaInfo } from '../lib/auth-api';

export interface AuthUser {
  id: string;
  email: string;
  plan?: 'free' | 'member';
  memberExpiresAt?: number | null;
  quota?: QuotaInfo;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (newToken: string, userData: AuthUser) => void;
  logout: () => void;
  /** 刷新用户信息（plan/quota），AI 调用后刷新剩余额度 */
  refreshUser: () => Promise<void>;
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

  const fetchUser = useCallback(async (tok: string) => {
    try {
      const res = await getCurrentUser(tok);
      if (res.success && res.data) {
        setUser(res.data);
        return true;
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        return false;
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setIsInitialized(true);
      return;
    }
    setIsLoading(true);
    fetchUser(token).finally(() => {
      setIsLoading(false);
      setIsInitialized(true);
    });
  }, [token, fetchUser]);

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

  const refreshUser = useCallback(async () => {
    if (token) await fetchUser(token);
  }, [token, fetchUser]);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, isLoading, isInitialized, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
