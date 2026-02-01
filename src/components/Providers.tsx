'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { CartProvider } from '@/context/CartContext';
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/Navbar'), {
  ssr: true,
});

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AuthGuard>
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
