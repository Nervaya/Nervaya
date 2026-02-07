'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Order } from '@/types/supplement.types';
import { formatPrice } from '@/utils/cart.util';
import api from '@/lib/axios';
import Pagination from '@/components/common/Pagination';
import { PAGE_SIZE_5 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';
import { FaShoppingBag } from 'react-icons/fa';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const limit = PAGE_SIZE_5;
  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedOrders = useMemo(() => orders.slice((page - 1) * limit, page * limit), [orders, page, limit]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await api.get('/orders')) as {
          success: boolean;
          data: Order[];
        };
        if (response.success && response.data) {
          setOrders(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>My Orders</h2>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>My Orders</h2>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>My Orders</h2>
        <div className={styles.emptyState}>
          <div className={styles.iconWrapper}>
            <FaShoppingBag className={styles.icon} />
          </div>
          <h3 className={styles.emptyTitle}>No orders yet</h3>
          <p className={styles.emptyText}>Your product purchases will appear here</p>
          <Link href="/supplements" className={styles.shopLink}>
            Browse Supplements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Orders</h2>
      <ul className={styles.ordersList} aria-label="Order history">
        {paginatedOrders.map((order) => (
          <li key={order._id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div>
                <h3 className={styles.orderId}>Order #{order._id.slice(-8)}</h3>
                <p className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className={styles.orderStatus}>
                <span className={`${styles.statusBadge} ${styles[order.orderStatus]}`}>
                  {order.orderStatus.toUpperCase()}
                </span>
                <span className={`${styles.paymentBadge} ${styles[order.paymentStatus]}`}>
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
            <ul className={styles.orderItems} aria-label="Order items">
              {order.items.map((item) => (
                <li key={`${order._id}-${item.name}-${item.quantity}`} className={styles.orderItem}>
                  <div className={styles.itemInfo}>
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</div>
                </li>
              ))}
            </ul>
            <div className={styles.orderFooter}>
              <div className={styles.orderTotal}>
                <strong>Total: {formatPrice(order.totalAmount)}</strong>
              </div>
              <Link href={`/supplements/order-success/${order._id}`} className={styles.viewOrderLink}>
                View Details
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {totalPages > 0 && (
        <div className={styles.paginationWrap}>
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            ariaLabel="My orders pagination"
          />
        </div>
      )}
    </div>
  );
}
