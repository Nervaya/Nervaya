'use client';

import { useState, useCallback } from 'react';
import { driftOffApi } from '@/lib/api/driftOff';
import type { IDriftOffResponse } from '@/types/driftOff.types';

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useAdminDriftOffResponses() {
  const [state, setState] = useState<FetchState<IDriftOffResponse[]>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await driftOffApi.getAllResponsesAdmin();
      setState({ data: res.data ?? null, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load responses',
      }));
    }
  }, []);

  return { ...state, refetch };
}

export function useAssignDriftOffVideo() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = useCallback(async ({ responseId, videoUrl }: { responseId: string; videoUrl: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await driftOffApi.assignVideo(responseId, videoUrl);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to assign video';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutateAsync, isLoading, error };
}
