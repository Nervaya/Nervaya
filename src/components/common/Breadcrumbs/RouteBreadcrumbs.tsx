'use client';

import { usePathname } from 'next/navigation';
import { getBreadcrumbsForPath } from '@/utils/breadcrumbConstants';
import Breadcrumbs from './Breadcrumbs';

const HIDE_BREADCRUMB_PATHS = new Set(['/', '/login', '/signup']);

export default function RouteBreadcrumbs() {
  const pathname = usePathname();
  if (!pathname || HIDE_BREADCRUMB_PATHS.has(pathname)) return null;

  const items = getBreadcrumbsForPath(pathname);
  if (items.length <= 1) return null;

  return <Breadcrumbs items={items} />;
}
