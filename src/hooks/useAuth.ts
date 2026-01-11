'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthData {
    user: {
        _id: string;
        email: string;
        name: string;
    };
    token: string;
}

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const signup = async (email: string, password: string, name: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            if (data.success && data.data?.token) {
                document.cookie = `auth_token=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
                router.push('/');
            }

            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.success && data.data?.token) {
                document.cookie = `auth_token=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
                router.push('/');
            }

            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
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
