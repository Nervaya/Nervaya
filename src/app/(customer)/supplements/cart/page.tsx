'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import { useLoading } from '@/context/LoadingContext';
import PageHeader from '@/components/PageHeader/PageHeader';
import { Cart, CartItem as CartItemType, Supplement } from '@/types/supplement.types';
import CartItem from '@/components/Cart/CartItem';
import CartSummary from '@/components/Cart/CartSummary';
import Pagination from '@/components/common/Pagination';
import { PAGE_SIZE_3 } from '@/lib/constants/pagination.constants';
import { cartApi } from '@/lib/api/cart';
import StatusState from '@/components/common/StatusState';
import styles from './styles.module.css';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    if (loading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [loading, showLoader, hideLoader]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartApi.get();
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (supplementId: string, quantity: number) => {
    setUpdating(true);
    try {
      setError(null);
      const response = await cartApi.update(supplementId, quantity);
      if (response.success && response.data) {
        setCart(response.data);
      } else {
        setError('Failed to update cart');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update cart';
      setError(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (supplementId: string) => {
    setUpdating(true);
    try {
      setError(null);
      const response = await cartApi.remove(supplementId);
      if (response.success && response.data) {
        setCart(response.data);
      } else {
        setError('Failed to remove item');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      setError(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    router.push('/supplements/checkout');
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Supplements', href: '/supplements' }, { label: 'Cart' }];
  const total = cart?.items.length || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_3));
  const start = (page - 1) * PAGE_SIZE_3;
  const paginatedItems = cart?.items.slice(start, start + PAGE_SIZE_3) || [];

  return (
    <Sidebar hideGlobalBreadcrumbs>
      <div className={styles.container}>
        <PageHeader title="Shopping Cart" breadcrumbs={breadcrumbs} />

        {error && <div className={styles.error}>{error}</div>}

        {!cart || total === 0 ? (
          <StatusState
            type="empty"
            title="Your cart is empty"
            message="Add some supplements to get started on your wellness journey!"
            action={
              <button onClick={() => router.push('/supplements')} className={styles.shopButton}>
                Continue Shopping
              </button>
            }
          />
        ) : (
          <div className={styles.content}>
            <ul className={styles.itemsSection} aria-label="Cart items">
              {paginatedItems.map((item: CartItemType) => {
                const key =
                  typeof item.supplementId === 'object' && item.supplementId && '_id' in item.supplementId
                    ? (item.supplementId as Supplement)._id
                    : String(item.supplementId);
                return (
                  <li key={key}>
                    <CartItem
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                      disabled={updating}
                    />
                  </li>
                );
              })}
            </ul>
            <div className={styles.summarySection}>
              <CartSummary cart={cart} onCheckout={handleCheckout} loading={updating} />
            </div>
          </div>
        )}

        {total > 0 && (
          <div className={styles.paginationWrap}>
            <Pagination total={total} page={page} limit={PAGE_SIZE_3} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </Sidebar>
  );
}
