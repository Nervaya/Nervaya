'use client';

import { useState, useCallback, useMemo } from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import { Badge, DataTable, StatusState, type BreadcrumbItem, type ColumnDef } from '@/components/common';
import { GlobalLoader } from '@/components/common/GlobalLoader';
import Button from '@/components/common/Button';
import OrderFilters from '@/components/Admin/OrderFilters';
import { useAdminOrders } from '@/queries/orders/useOrders';
import type { OrderFiltersParams } from '@/lib/api/orders';
import type { Order } from '@/types/supplement.types';
import { formatPrice } from '@/utils/cart.util';
import { PAGE_SIZE_10 } from '@/lib/constants/pagination.constants';

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

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'purple' | 'neutral';

function orderStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    case 'confirmed':
    case 'shipped':
      return 'info';
    default:
      return 'neutral';
  }
}

function paymentStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'refunded':
      return 'error';
    default:
      return 'neutral';
  }
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<OrderFiltersParams>({});
  const limit = PAGE_SIZE_10;
  const { data: orders, meta, isLoading, error, refetch } = useAdminOrders(page, limit, filters);
  const paginationMeta = meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Orders' }];

  const handleFiltersApply = useCallback((newFilters: OrderFiltersParams) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        key: 'id',
        header: 'Order',
        sortable: true,
        sortAccessor: (order) => String(order._id),
        cell: (order) => (
          <span style={{ fontFamily: 'var(--font-mono)' }}>#{String(order._id).slice(-8).toUpperCase()}</span>
        ),
        width: '140px',
      },
      {
        key: 'items',
        header: 'Items',
        cell: (order) => {
          const count = order.items.length;
          const firstName = order.items[0]?.name ?? 'No items';
          if (count <= 1) return firstName;
          return `${firstName} +${count - 1} more`;
        },
        hideOn: 'sm',
      },
      {
        key: 'total',
        header: 'Total',
        sortable: true,
        sortAccessor: (order) => order.totalAmount,
        cell: (order) => formatPrice(order.totalAmount),
        align: 'right',
        width: '120px',
      },
      {
        key: 'orderStatus',
        header: 'Status',
        sortable: true,
        sortAccessor: (order) => order.orderStatus,
        cell: (order) => (
          <Badge variant={orderStatusVariant(order.orderStatus)} shape="pill" size="sm">
            {order.orderStatus}
          </Badge>
        ),
        align: 'right',
        width: '130px',
      },
      {
        key: 'paymentStatus',
        header: 'Payment',
        sortable: true,
        sortAccessor: (order) => order.paymentStatus,
        cell: (order) => (
          <Badge variant={paymentStatusVariant(order.paymentStatus)} shape="pill" size="sm">
            {order.paymentStatus}
          </Badge>
        ),
        align: 'right',
        width: '130px',
        hideOn: 'md',
      },
      {
        key: 'date',
        header: 'Date',
        sortable: true,
        sortAccessor: (order) => new Date(order.createdAt).getTime(),
        cell: (order) => new Date(order.createdAt).toLocaleDateString(),
        align: 'right',
        width: '140px',
        hideOn: 'sm',
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Orders" subtitle="View all orders (read-only)." breadcrumbs={breadcrumbs} />
        <GlobalLoader label="Loading orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Orders" subtitle="View all orders (read-only)." breadcrumbs={breadcrumbs} />
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
            <Button type="button" variant="primary" size="md" fullWidth={false} onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Orders" subtitle="View all orders (read-only)." breadcrumbs={breadcrumbs} />
      <OrderFilters
        initialFilters={filters}
        onApply={handleFiltersApply}
        onReset={handleFiltersReset}
        activeCount={countActiveFilters(filters)}
      />
      <DataTable<Order>
        columns={columns}
        data={orders ?? []}
        rowKey={(order) => order._id}
        title="Orders"
        countLabel={(t) => `${t} Order${t === 1 ? '' : 's'}`}
        total={paginationMeta.total}
        emptyMessage="No orders found."
        ariaLabel="Orders"
        pagination={{
          page: paginationMeta.page,
          limit: paginationMeta.limit,
          total: paginationMeta.total,
          totalPages: paginationMeta.totalPages,
          onPageChange: setPage,
          ariaLabel: 'Orders pagination',
        }}
      />
    </div>
  );
}
