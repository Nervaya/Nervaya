'use client';

import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

interface LowStockItem {
  _id?: string;
  name: string;
  stock: number;
}

export interface LowStockAlertsProps {
  items: LowStockItem[];
  emptyMessage?: string;
}

export default function LowStockAlerts({ items, emptyMessage = 'No low stock items.' }: LowStockAlertsProps) {
  if (!items?.length) {
    return (
      <div className={styles.empty} role="status">
        {emptyMessage}
      </div>
    );
  }
  return (
    <ul className={styles.list} aria-label="Low stock supplements">
      {items.map((item, i) => (
        <li key={item._id ?? i} className={styles.item}>
          <span className={styles.name}>{item.name}</span>
          <span className={item.stock === 0 ? styles.outOfStock : styles.lowStock}>
            {item.stock === 0 ? 'Out of stock' : `Stock: ${item.stock}`}
          </span>
        </li>
      ))}
      <li className={styles.footer}>
        <Link href="/admin/supplements" className={styles.link}>
          Manage supplements
        </Link>
      </li>
    </ul>
  );
}
