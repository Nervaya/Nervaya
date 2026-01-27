'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types/supplement.types';
import { formatPrice } from '@/utils/cart.util';
import api from '@/lib/axios';
import styles from './styles.module.css';

export default function OrderSuccessPage() {
  const params = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      type OrderResponse = { success: boolean; data: Order[] };
      const response = (await api.get('/orders')) as OrderResponse;
      if (response.success && response.data) {
        const foundOrder = response.data.find((o) => o._id === params.orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.orderId) {
      fetchOrder();
    }
  }, [params.orderId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Order not found'}</div>
        <Link href="/supplements" className={styles.link}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.success}>
        <div className={styles.icon}>✓</div>
        <h1 className={styles.title}>Order Placed Successfully!</h1>
        <p className={styles.message}>
          Thank you for your purchase. Your order has been confirmed and will be
          shipped soon.
        </p>
        <div className={styles.orderDetails}>
          <div className={styles.detailRow}>
            <span>Order ID:</span>
            <span className={styles.orderId}>{order._id}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Total Amount:</span>
            <span className={styles.amount}>
              {formatPrice(order.totalAmount)}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span>Payment Status:</span>
            <span
              className={`${styles.status} ${
                order.paymentStatus === 'paid' ? styles.paid : styles.pending
              }`}
            >
              {order.paymentStatus.toUpperCase()}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span>Order Status:</span>
            <span className={styles.status}>
              {order.orderStatus.toUpperCase()}
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/supplements" className={styles.button}>
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className={`${styles.button} ${styles.secondary}`}
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
