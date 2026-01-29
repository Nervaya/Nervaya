'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: async () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    try {
      const response = (await api.get('/cart')) as {
        success: boolean;
        data: unknown;
      };
      if (
        response.success &&
        response.data &&
        typeof response.data === 'object' &&
        'items' in response.data &&
        Array.isArray((response.data as { items: unknown[] }).items)
      ) {
        setCartCount((response.data as { items: unknown[] }).items.length);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Defer cart fetch to not block initial render
    const deferCartFetch = () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => refreshCart(), { timeout: 2000 });
      } else {
        setTimeout(() => refreshCart(), 100);
      }
    };
    deferCartFetch();
  }, [isAuthenticated, refreshCart]);

  useEffect(() => {
    const handleAuthChange = () => refreshCart();
    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => window.removeEventListener('auth-state-changed', handleAuthChange);
  }, [refreshCart]);

  const displayCount = isAuthenticated ? cartCount : 0;
  return <CartContext.Provider value={{ cartCount: displayCount, refreshCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
