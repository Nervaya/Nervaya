'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ApiResponse } from '@/lib/utils/response.util';
import { ROLES, Role } from '@/lib/constants/roles';
import { COOKIE_NAMES, COOKIE_OPTIONS } from '@/utils/cookieConstants';
import { ROUTES } from '@/utils/routesConstants';

interface AuthData {
    user: {
        _id: string;
        email: string;
        name: string;
        role: Role;
    };
    token: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuthSuccess = (data: AuthData) => {
    if (data.token) {
      document.cookie = `${COOKIE_NAMES.AUTH_TOKEN}=${data.token}; path=/; max-age=${COOKIE_OPTIONS.AUTH_TOKEN_MAX_AGE}`;

      if (data.user.role === ROLES.ADMIN) {
        router.push(ROUTES.ADMIN_DASHBOARD);
      } else {
        router.push(ROUTES.HOME);
      }
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ email: string; password: string; name: string }, ApiResponse<AuthData>>('/auth/signup', { email, password, name });

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
      const response = await api.post<{ email: string; password: string }, ApiResponse<AuthData>>('/auth/login', { email, password });

      if (response.success && response.data) {
        handleAuthSuccess(response.data);
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      // Ensure we propagate the error message cleanly
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    document.cookie = `${COOKIE_NAMES.AUTH_TOKEN}=; path=/; max-age=0`;
    router.push(ROUTES.LOGIN);
  };

  return { signup, login, logout, loading, error };
}
