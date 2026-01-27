'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import { Cart } from '@/types/supplement.types';
import CartItem from '@/components/Cart/CartItem';
import CartSummary from '@/components/Cart/CartSummary';
import api from '@/lib/axios';
import styles from './styles.module.css';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await api.get('/cart')) as {
        success: boolean;
        data: Cart;
      };
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
      const response = (await api.put('/cart', {
        supplementId,
        quantity,
      })) as { success: boolean; data: Cart };
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
      const response = (await api.delete(`/cart?supplementId=${supplementId}`)) as { success: boolean; data: Cart };
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

  if (loading) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <div className={styles.loading}>Loading cart...</div>
        </div>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </Sidebar>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <div className={styles.empty}>
            <h2>Your cart is empty</h2>
            <p>Add some supplements to get started!</p>
            <button onClick={() => router.push('/supplements')} className={styles.shopButton}>
              Continue Shopping
            </button>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Shopping Cart</h1>
        </header>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.content}>
          <div className={styles.itemsSection}>
            {cart.items.map((item) => {
              return (
                <CartItem
                  key={item.supplement._id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  disabled={updating}
                />
              );
            })}
          </div>
          <div className={styles.summarySection}>
            <CartSummary cart={cart} onCheckout={handleCheckout} loading={updating} />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
