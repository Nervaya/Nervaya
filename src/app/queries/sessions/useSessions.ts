import { useState, useEffect, useCallback } from 'react';
import { sessionsApi, type PaginationMeta, type SessionFiltersParams } from '@/lib/api/sessions';
import type { Session } from '@/types/session.types';

export function useAdminSessions(page: number, limit: number, filters?: SessionFiltersParams) {
  const [data, setData] = useState<Session[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await sessionsApi.getAllForAdmin(page, limit, filters);
      if (response.success && response.data) {
        setData(response.data.data);
        setMeta(response.data.meta);
      } else {
        setData([]);
        setMeta(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      setData([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { data, meta, isLoading, error, refetch: fetchSessions };
}
