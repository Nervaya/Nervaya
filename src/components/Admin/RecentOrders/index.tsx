'use client';

import React from 'react';
import Link from 'next/link';
import { formatPrice } from '@/utils/cart.util';
import styles from './styles.module.css';

interface OrderRow {
  _id: string;
  userId: string;
  totalAmount: number;
  orderStatus?: string;
  paymentStatus?: string;
  createdAt: string | Date;
}

export interface RecentOrdersProps {
  orders: OrderRow[];
  emptyMessage?: string;
}

export default function RecentOrders({ orders, emptyMessage = 'No recent orders.' }: RecentOrdersProps) {
  if (!orders?.length) {
    return (
      <div className={styles.empty} role="status">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className={styles.wrap}>
      <table className={styles.table} aria-label="Recent orders">
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">User</th>
            <th scope="col">Amount</th>
            <th scope="col">Status</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>
                <Link href="/admin/orders" className={styles.link}>
                  #{String(order._id).slice(-8)}
                </Link>
              </td>
              <td className={styles.userId}>{String(order.userId).slice(0, 8)}…</td>
              <td>{formatPrice(order.totalAmount)}</td>
              <td>
                <span className={styles.badge}>{order.orderStatus ?? order.paymentStatus ?? '—'}</span>
              </td>
              <td className={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
