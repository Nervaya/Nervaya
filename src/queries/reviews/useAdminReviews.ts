import { useState, useEffect, useCallback } from 'react';
import {
  adminReviewsApi,
  type AdminReview,
  type PaginationMeta,
  type AdminReviewFiltersParams,
} from '@/lib/api/adminReviews';

export function useAdminReviews(page: number, limit: number, filters?: AdminReviewFiltersParams) {
  const [data, setData] = useState<AdminReview[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminReviewsApi.getAll(page, limit, filters);
      if (response.success && response.data) {
        setData(response.data.data);
        setMeta(response.data.meta);
      } else {
        setData([]);
        setMeta(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
      setData([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { data, meta, isLoading, error, refetch: fetchReviews };
}
