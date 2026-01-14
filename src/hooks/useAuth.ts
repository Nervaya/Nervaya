'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ApiResponse } from '@/lib/utils/response.util';
import { ROLES, Role } from '@/lib/constants/roles';

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
            document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

            if (data.user.role === ROLES.ADMIN) {
                router.push('/dashboard'); // Or /admin/dashboard
            } else {
                router.push('/');
            }
        }
    };

    const signup = async (email: string, password: string, name: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post<any, ApiResponse<AuthData>>('/auth/signup', { email, password, name });

            if (response.success && response.data) {
                handleAuthSuccess(response.data);
            }
            return response;
        } catch (err: any) {
            const message = err.message || 'Signup failed';
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
            const response = await api.post<any, ApiResponse<AuthData>>('/auth/login', { email, password });

            if (response.success && response.data) {
                handleAuthSuccess(response.data);
            }
            return response;
        } catch (err: any) {
            const message = err.message || 'Login failed';
            setError(message);
            // Ensure we propagate the error message cleanly
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        document.cookie = 'auth_token=; path=/; max-age=0';
        router.push('/login');
    };

    return { signup, login, logout, loading, error };
}
