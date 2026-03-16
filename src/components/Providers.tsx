'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { CartProvider } from '@/context/CartContext';
import dynamic from 'next/dynamic';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';
import { Toaster } from 'sonner';

import { SidebarProvider } from '@/context/SidebarContext';

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
          <SidebarProvider>
            <ScrollToTop />
            <Navbar />
            {children}
            <Toaster
              position="top-center"
              closeButton
              toastOptions={{
                className: 'sonner-toast',
                style: {
                  borderRadius: '12px',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: 'var(--color-card-shadow)',
                  padding: '12px 16px',
                },
              }}
            />
          </SidebarProvider>
        </CartProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
