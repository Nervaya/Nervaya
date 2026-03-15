import { useState, useEffect, useCallback } from 'react';
import { ordersApi, type PaginationMeta, type OrderFiltersParams } from '@/lib/api/orders';
import type { Order } from '@/types/supplement.types';

export function useAdminOrders(page: number, limit: number, filters?: OrderFiltersParams) {
  const [data, setData] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ordersApi.getAllForAdmin(page, limit, filters);
      if (response.success && response.data) {
        setData(response.data.data);
        setMeta(response.data.meta);
      } else {
        setData([]);
        setMeta(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      setData([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { data, meta, isLoading, error, refetch: fetchOrders };
}
