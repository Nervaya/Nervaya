'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ApiResponse } from '@/lib/utils/response.util';
import { ROLES, Role } from '@/lib/constants/roles';
import { ROUTES } from '@/utils/routesConstants';

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
  login: (email: string, password: string) => Promise<ApiResponse<AuthData>>;
  signup: (email: string, password: string, name: string) => Promise<ApiResponse<AuthData>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Initial loading true to check auth
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuthSuccess = (data: AuthData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      // Dispatch custom event to notify CartContext/components
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
    }
    setUser(data.user);
    setIsAuthenticated(true);

    if (data.user.role === ROLES.ADMIN) {
      router.push(ROUTES.ADMIN_DASHBOARD);
    } else {
      router.push(ROUTES.HOME);
    }
  };

  const checkAuth = async () => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsAuthenticated(isLoggedIn);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    // Listen for auth events (e.g. from axios 401 interceptor)
    const handleAuthEvent = () => checkAuth();
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-state-changed', handleAuthEvent);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-state-changed', handleAuthEvent);
      }
    };
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = (await api.post('/auth/signup', {
        email,
        password,
        name,
      })) as ApiResponse<AuthData>;

      if (response.success && response.data) {
        handleAuthSuccess(response.data);
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = (await api.post('/auth/login', {
        email,
        password,
      })) as ApiResponse<AuthData>;

      if (response.success && response.data) {
        handleAuthSuccess(response.data);
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
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
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setLoading(false);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
    }
    setUser(null);
    setIsAuthenticated(false);
    router.push(ROUTES.LOGIN);
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
