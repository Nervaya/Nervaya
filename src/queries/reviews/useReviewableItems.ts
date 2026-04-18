import { useState, useEffect, useCallback } from 'react';
import { reviewsApi, type ReviewableItem } from '@/lib/api/reviews';

export function useReviewableItems(enabled = true) {
  const [data, setData] = useState<ReviewableItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    if (!enabled) return;
    let active = true;

    async function fetch() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await reviewsApi.getReviewableItems();
        if (!active) return;
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setData([]);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load reviewable items');
        setData([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void fetch();
    return () => {
      active = false;
    };
  }, [enabled]);

  return { data, isLoading, error, refetch: fetchItems };
}
