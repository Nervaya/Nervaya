'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/lib/constants/roles';
import {
  AUTH_ROUTES,
  ADMIN_ROUTES,
  PROTECTED_ROUTES,
  CUSTOMER_ONLY_ROUTES,
  ROUTES,
  isProtectedPath,
} from '@/utils/routesConstants';
import { validateReturnUrl } from '@/utils/returnUrl';
import LoadingScreen from '@/components/AuthGuard/LoadingScreen';

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { initializing, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (initializing) return;

    if (isAuthRoute(pathname)) {
      if (isAuthenticated) {
        router.replace(user?.role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD);
      }
      return;
    }

    if (isProtectedPath(pathname) && !isAuthenticated) {
      const safeReturn = validateReturnUrl(pathname);
      const loginUrl = safeReturn ? `${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(safeReturn)}` : ROUTES.LOGIN;
      router.replace(loginUrl);
      return;
    }

    if (ADMIN_ROUTES.some((route) => pathname.startsWith(route)) && isAuthenticated && user?.role !== ROLES.ADMIN) {
      router.replace(ROUTES.DASHBOARD);
      return;
    }

    if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && isAuthenticated && user?.role === ROLES.ADMIN) {
      router.replace(ROUTES.ADMIN_DASHBOARD);
      return;
    }

    if (
      CUSTOMER_ONLY_ROUTES.some((route) => pathname.startsWith(route)) &&
      isAuthenticated &&
      user?.role === ROLES.ADMIN
    ) {
      router.replace(ROUTES.ADMIN_DASHBOARD);
    }
  }, [initializing, isAuthenticated, user?.role, pathname, router]);

  if (initializing) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
