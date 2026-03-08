import { useState, useEffect } from 'react';
import { therapistsApi } from '@/lib/api/therapists';
import { Therapist } from '@/types/therapist.types';

export function useTherapists() {
  const [data, setData] = useState<Therapist[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchTherapists() {
      setIsLoading(true);
      try {
        const result = await therapistsApi.getAll();
        if (active) {
          setData(result.data || []);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void fetchTherapists();

    return () => {
      active = false;
    };
  }, []);

  return { data, isLoading, error };
}
