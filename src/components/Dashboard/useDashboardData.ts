'use client';

import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api/dashboard';
import { driftOffApi } from '@/lib/api/driftOff';
import type { Session } from '@/types/session.types';
import type { Order } from '@/types/supplement.types';
import type { ISleepAssessmentResponse } from '@/types/sleepAssessment.types';
import type { IDriftOffResponse } from '@/types/driftOff.types';

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestAssessment, setLatestAssessment] = useState<ISleepAssessmentResponse | null>(null);
  const [inProgressAssessment, setInProgressAssessment] = useState<ISleepAssessmentResponse | null>(null);
  const [driftOffResponses, setDriftOffResponses] = useState<IDriftOffResponse[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, ordersRes, latestRes, inProgressRes, driftOffRes] = await Promise.all([
        dashboardApi.getSessions(),
        dashboardApi.getOrders(),
        dashboardApi.getLatestAssessment(),
        dashboardApi.getInProgressAssessment(),
        driftOffApi.getResponses().catch(() => ({ success: true, data: [] })),
      ]);

      setSessions(sessionsRes?.data || []);
      setOrders(ordersRes?.data || []);
      setLatestAssessment(latestRes?.data ?? null);
      setInProgressAssessment(inProgressRes?.data ?? null);
      setDriftOffResponses(driftOffRes?.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    loading,
    error,
    sessions,
    orders,
    latestAssessment,
    inProgressAssessment,
    driftOffResponses,
    retry: fetchDashboardData,
  };
}
