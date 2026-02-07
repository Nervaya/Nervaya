'use client';

import { useState, useCallback } from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import Pagination from '@/components/common/Pagination';
import LottieLoader from '@/components/common/LottieLoader';
import StatusState from '@/components/common/StatusState';
import OrderFilters from '@/components/Admin/OrderFilters';
import { useAdminOrders } from '@/app/queries/orders/useOrders';
import type { OrderFiltersParams } from '@/lib/api/orders';
import { formatPrice } from '@/utils/cart.util';
import { PAGE_SIZE_10 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';

function countActiveFilters(f: OrderFiltersParams): number {
  let n = 0;
  if (f.orderStatus) n++;
  if (f.paymentStatus) n++;
  if (f.dateFrom) n++;
  if (f.dateTo) n++;
  if (f.minAmount != null && !Number.isNaN(f.minAmount)) n++;
  if (f.maxAmount != null && !Number.isNaN(f.maxAmount)) n++;
  if (f.userId?.trim()) n++;
  return n;
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<OrderFiltersParams>({});
  const limit = PAGE_SIZE_10;
  const { data: orders, meta, isLoading, error, refetch } = useAdminOrders(page, limit, filters);

  const handleFiltersApply = useCallback((newFilters: OrderFiltersParams) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Orders" subtitle="View all orders (read-only)." />
        <OrderFilters
          initialFilters={filters}
          onApply={handleFiltersApply}
          onReset={handleFiltersReset}
          activeCount={countActiveFilters(filters)}
        />
        <div className={styles.loaderWrapper}>
          <LottieLoader width={200} height={200} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Orders" subtitle="View all orders (read-only)." />
        <OrderFilters
          initialFilters={filters}
          onApply={handleFiltersApply}
          onReset={handleFiltersReset}
          activeCount={countActiveFilters(filters)}
        />
        <StatusState
          type="error"
          message={error}
          action={
            <button type="button" onClick={() => refetch()} className={styles.retryButton}>
              Retry
            </button>
          }
        />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div>
        <PageHeader title="Orders" subtitle="View all orders (read-only)." />
        <OrderFilters
          initialFilters={filters}
          onApply={handleFiltersApply}
          onReset={handleFiltersReset}
          activeCount={countActiveFilters(filters)}
        />
        <StatusState type="empty" message="No orders found." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Orders" subtitle="View all orders (read-only)." />
      <OrderFilters
        initialFilters={filters}
        onApply={handleFiltersApply}
        onReset={handleFiltersReset}
        activeCount={countActiveFilters(filters)}
      />
      <ul className={styles.list} aria-label="All orders">
        {orders.map((order) => (
          <li key={order._id} className={styles.card}>
            <div className={styles.orderHeader}>
              <div>
                <h3 className={styles.orderId}>Order #{String(order._id).slice(-8)}</h3>
                <p className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</p>
                <p className={styles.userId}>User ID: {String(order.userId)}</p>
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
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</div>
                </li>
              ))}
            </ul>
            <div className={styles.orderFooter}>
              <div className={styles.orderTotal}>
                <strong>Total: {formatPrice(order.totalAmount)}</strong>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {meta && meta.totalPages > 0 && (
        <div className={styles.paginationWrap}>
          {meta.totalPages > 0 ? (
            <Pagination
              page={meta.page}
              limit={meta.limit}
              total={meta.total}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              ariaLabel="Orders pagination"
            />
          ) : (
            <p className={styles.paginationSummary} aria-live="polite">
              Showing {Math.min((meta.page - 1) * meta.limit + 1, meta.total)}–
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
