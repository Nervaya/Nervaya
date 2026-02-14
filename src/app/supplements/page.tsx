'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import StatusState from '@/components/common/StatusState';
import SupplementCatalog from '@/components/Supplements/SupplementCatalog';
import { Supplement } from '@/types/supplement.types';
import { supplementsApi } from '@/lib/api/supplements';
import { cartApi } from '@/lib/api/cart';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import { ROUTES } from '@/utils/routesConstants';
import styles from './styles.module.css';

export default function SupplementsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = useCallback(
    async (supplementId: string, quantity: number) => {
      if (!isAuthenticated) {
        router.push(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent('/supplements')}`);
        return;
      }
      const response = await cartApi.add(supplementId, quantity);
      if (response.success) {
        await refreshCart();
      } else {
        throw new Error('Failed to add to cart');
      }
    },
    [isAuthenticated, router, refreshCart],
  );

  const fetchSupplements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplementsApi.getAll();
      if (response.success && response.data) {
        setSupplements(response.data);
      } else {
        setSupplements([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supplements');
      setSupplements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupplements();
  }, [fetchSupplements]);

  const showFailure = !loading && error != null;
  const showEmpty = !loading && !error && supplements.length === 0;

  return (
    <Sidebar>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <PageHeader title="Supplements" subtitle="Discover our range of health supplements" />
          {error && !showFailure && <div className={styles.error}>{error}</div>}
          {showFailure && (
            <StatusState
              type="error"
              variant="minimal"
              title="Failed to load supplements"
              message={error ?? 'Something went wrong'}
              action={
                <button type="button" onClick={fetchSupplements} className={styles.retryButton}>
                  Try again
                </button>
              }
            />
          )}
          {showEmpty && (
            <StatusState
              type="empty"
              variant="minimal"
              title="No supplements available"
              message="There are no supplements to display at the moment."
              action={
                <Link href="/supplements" className={styles.browseLink}>
                  Browse supplements
                </Link>
              }
            />
          )}
          {!showFailure && !showEmpty && (
            <SupplementCatalog supplements={supplements} loading={loading} onAddToCart={handleAddToCart} />
          )}
        </div>
      </div>
    </Sidebar>
  );
}
