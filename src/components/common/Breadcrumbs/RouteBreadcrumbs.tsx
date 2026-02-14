'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/axios';
import { getBreadcrumbsForPath } from '@/utils/breadcrumbConstants';
import { supplementsApi } from '@/lib/api/supplements';
import Breadcrumbs from './Breadcrumbs';

const HIDE_BREADCRUMB_PATHS = new Set(['/', '/login', '/signup']);

const SUPPLEMENT_PATH_REGEX = /^\/supplements\/([^/]+)$/;
const ORDER_SUCCESS_PATH_REGEX = /^\/supplements\/order-success\/([^/]+)$/;
const THERAPIST_SLOTS_PATH_REGEX = /^\/admin\/therapists\/([^/]+)\/slots$/;

function formatOrderNumber(orderId: string): string {
  const year = new Date().getFullYear();
  const short = orderId.replace(/-/g, '').slice(-8).toUpperCase();
  return `Order #NS-${year}-${short}`;
}

export default function RouteBreadcrumbs() {
  const pathname = usePathname();
  const [asyncLabel, setAsyncLabel] = useState<string | null>(null);

  const baseItems = useMemo(() => {
    if (!pathname || HIDE_BREADCRUMB_PATHS.has(pathname)) {
      return [];
    }
    return getBreadcrumbsForPath(pathname);
  }, [pathname]);

  const syncLabel = useMemo(() => {
    const orderMatch = pathname?.match(ORDER_SUCCESS_PATH_REGEX);
    if (orderMatch) {
      return formatOrderNumber(orderMatch[1]);
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const supplementMatch = pathname.match(SUPPLEMENT_PATH_REGEX);
    if (supplementMatch) {
      const supplementId = supplementMatch[1];
      supplementsApi
        .getById(supplementId)
        .then((response) => {
          if (response.success && response.data?.name) {
            setAsyncLabel(response.data.name);
          } else {
            setAsyncLabel(null);
          }
        })
        .catch(() => {
          setAsyncLabel(null);
        });
      return;
    }

    const therapistMatch = pathname.match(THERAPIST_SLOTS_PATH_REGEX);
    if (therapistMatch) {
      const therapistId = therapistMatch[1];
      (api.get(`/therapists/${therapistId}`) as unknown as Promise<{ success: boolean; data?: { name: string } }>)
        .then((response) => {
          if (response.success && response.data?.name) {
            setAsyncLabel(response.data.name);
          } else {
            setAsyncLabel(null);
          }
        })
        .catch(() => {
          setAsyncLabel(null);
        });
    }
  }, [pathname]);

  const items = useMemo(() => {
    if (baseItems.length === 0) return [];

    const updatedItems = [...baseItems];
    const lastItem = updatedItems[updatedItems.length - 1];

    const needsAsyncLabel = pathname?.match(SUPPLEMENT_PATH_REGEX) || pathname?.match(THERAPIST_SLOTS_PATH_REGEX);
    const dynamicLabel = syncLabel || (needsAsyncLabel ? asyncLabel : null);

    if (dynamicLabel && lastItem) {
      lastItem.label = dynamicLabel;
    }

    return updatedItems;
  }, [baseItems, syncLabel, asyncLabel, pathname]);

  if (!pathname || HIDE_BREADCRUMB_PATHS.has(pathname) || items.length <= 1) {
    return null;
  }

  return <Breadcrumbs items={items} />;
}
