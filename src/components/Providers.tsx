'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { CartProvider } from '@/context/CartContext';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Lazy-load Navbar to reduce initial bundle size
const Navbar = dynamic(() => import('@/components/Navbar'), {
  ssr: true,
});

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <AuthProvider>
      <AuthGuard>
        <CartProvider>
          {!isAuthPage && <Navbar />}
          {isAuthPage && (
            <nav style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 50 }}>
              <Link href="/">
                <Image src="/icons/nervaya-logo.svg" alt="logo" width={150} height={50} />
              </Link>
            </nav>
          )}
          {children}
        </CartProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
