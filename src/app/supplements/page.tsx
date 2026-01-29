'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import { Supplement } from '@/types/supplement.types';
import SupplementGrid from '@/components/Supplements/SupplementGrid';
import { supplementsApi } from '@/lib/api/supplements';
import { cartApi } from '@/lib/api/cart';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/routesConstants';
import styles from './styles.module.css';

export default function SupplementsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplementsApi.getAll();
      if (response.success && response.data) {
        setSupplements(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supplements');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (supplementId: string, quantity: number) => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(ROUTES.SUPPLEMENTS);
      router.push(`${ROUTES.LOGIN}?returnUrl=${returnUrl}`);
      return;
    }
    try {
      setError(null);
      const response = await cartApi.add(supplementId, quantity);
      if (!response.success) {
        setError('Failed to add to cart');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      setError(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchSupplements();
  }, []);

  return (
    <Sidebar>
      <div className={styles.container}>
        <PageHeader title="Supplements" subtitle="Discover our range of health supplements" />
        {error && <div className={styles.error}>{error}</div>}
        <SupplementGrid supplements={supplements} onAddToCart={handleAddToCart} loading={loading} />
      </div>
    </Sidebar>
  );
}
