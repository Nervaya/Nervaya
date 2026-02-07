import { useState, useEffect, useCallback } from 'react';
import { adminStatsApi } from '@/lib/api/adminStats';
import type { DashboardStats } from '@/lib/services/adminStats.service';

export function useAdminStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminStatsApi.getDashboardStats();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, isLoading, error, refetch: fetchStats };
}
