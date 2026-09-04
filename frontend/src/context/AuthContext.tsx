'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authAPI } from '@/utils/api';

export type AppUser = {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role: 'user' | 'agent' | 'broker' | 'lawyer' | 'mortgage' | 'admin';
  phone?: string;
  territory?: string;
  canAccessAgentPortal?: boolean;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (payload: Record<string, string>) => Promise<AppUser>;
  logout: () => void;
  isDealer: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEALER_ROLES = ['agent', 'broker', 'admin'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI
      .getCurrentUser()
      .then((me) => setUser(me))
      .catch(() => {
        localStorage.removeItem('auth_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authAPI.login(email, password);
    setUser(data.user);
    return data.user as AppUser;
  }, []);

  const register = useCallback(async (payload: Record<string, string>) => {
    const data = await authAPI.register(payload);
    if (data.token || data.access_token) {
      localStorage.setItem('auth_token', data.token || data.access_token);
    }
    setUser(data.user);
    return data.user as AppUser;
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    window.location.href = '/';
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isDealer: !!user && DEALER_ROLES.includes(user.role),
    }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
