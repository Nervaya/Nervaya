'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: async () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
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
      }
    } catch (error) {
      console.error('Failed to fetch cart count', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshCart();

    // Listen for auth changes to refresh cart
    const handleAuthChange = () => refreshCart();
    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => window.removeEventListener('auth-state-changed', handleAuthChange);
  }, []);

  return <CartContext.Provider value={{ cartCount, refreshCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
