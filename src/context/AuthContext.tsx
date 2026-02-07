'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ApiResponse } from '@/lib/utils/response.util';
import { getApiErrorMessage } from '@/lib/utils/apiError.util';
import { ROLES, Role } from '@/lib/constants/roles';
import { ROUTES } from '@/utils/routesConstants';
import { validateReturnUrl } from '@/utils/returnUrl';
import { AUTH_STORAGE_KEYS } from '@/utils/cookieConstants';

interface User {
  _id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthData {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, returnUrl?: string) => Promise<ApiResponse<AuthData>>;
  signup: (email: string, password: string, name: string, returnUrl?: string) => Promise<ApiResponse<AuthData>>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    const expiresAt = localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_EXPIRES_AT);
    if (expiresAt) {
      const exp = Number(expiresAt);
      if (!Number.isFinite(exp) || Date.now() >= exp) {
        localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_USER);
        localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_EXPIRES_AT);
        localStorage.removeItem(AUTH_STORAGE_KEYS.IS_LOGGED_IN);
        return null;
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearAuthStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_USER);
  localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_EXPIRES_AT);
  localStorage.removeItem(AUTH_STORAGE_KEYS.IS_LOGGED_IN);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const hydrateFromStore = () => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const handleAuthSuccess = (data: AuthData, returnUrl?: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));
      localStorage.setItem(AUTH_STORAGE_KEYS.IS_LOGGED_IN, 'true');
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
    }
    setUser(data.user);
    setIsAuthenticated(true);

    const safeReturnUrl = validateReturnUrl(returnUrl);
    if (data.user.role === ROLES.ADMIN) {
      router.push(ROUTES.ADMIN_DASHBOARD);
    } else if (safeReturnUrl) {
      router.push(safeReturnUrl);
    } else {
      router.push(ROUTES.DASHBOARD);
    }
  };

  useEffect(() => {
    hydrateFromStore();

    const handleAuthEvent = () => hydrateFromStore();
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-state-changed', handleAuthEvent);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-state-changed', handleAuthEvent);
      }
    };
  }, []);

  const signup = async (email: string, password: string, name: string, returnUrl?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = (await api.post('/auth/signup', {
        email,
        password,
        name,
      })) as ApiResponse<AuthData>;

      if (response.success && response.data) {
        handleAuthSuccess(response.data, returnUrl);
      }
      return response;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Signup failed');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, returnUrl?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = (await api.post('/auth/login', {
        email,
        password,
      })) as ApiResponse<AuthData>;

      if (response.success && response.data) {
        handleAuthSuccess(response.data, returnUrl);
      }
      return response;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Login failed');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      setLoading(false);
    }

    clearAuthStorage();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
    }
    setUser(null);
    setIsAuthenticated(false);
    router.push(ROUTES.LOGIN);
  };

  const clearError = () => setError(null);

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...updates };
    setUser(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEYS.AUTH_USER, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        signup,
        logout,
        clearError,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
