import { useState, useEffect, useCallback } from 'react';
import { reviewsApi, type ReviewableItem } from '@/lib/api/reviews';

export function useReviewableItems() {
  const [data, setData] = useState<ReviewableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reviewsApi.getReviewableItems();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviewable items');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { data, isLoading, error, refetch: fetchItems };
}
