import { useState, useEffect, useCallback } from 'react';
import { supplementsApi, type PaginationMeta, type SupplementFiltersParams } from '@/lib/api/supplements';
import type { Supplement } from '@/types/supplement.types';

export function useAdminSupplements(page: number, limit: number, filters?: SupplementFiltersParams) {
  const [data, setData] = useState<Supplement[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await supplementsApi.getAllPaginated(page, limit, filters);
      if (response.success && response.data) {
        setData(response.data.data);
        setMeta(response.data.meta);
      } else {
        setData([]);
        setMeta(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supplements');
      setData([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchSupplements();
  }, [fetchSupplements]);

  return { data, meta, isLoading, error, refetch: fetchSupplements };
}
