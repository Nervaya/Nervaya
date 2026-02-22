'use client';

import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api/dashboard';
import type { Session } from '@/types/session.types';
import type { Order } from '@/types/supplement.types';
import type { ISleepAssessmentResponse } from '@/types/sleepAssessment.types';

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestAssessment, setLatestAssessment] = useState<ISleepAssessmentResponse | null>(null);
  const [inProgressAssessment, setInProgressAssessment] = useState<ISleepAssessmentResponse | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, ordersRes, latestRes, inProgressRes] = await Promise.all([
        dashboardApi.getSessions(),
        dashboardApi.getOrders(),
        dashboardApi.getLatestAssessment(),
        dashboardApi.getInProgressAssessment(),
      ]);

      setSessions(sessionsRes?.data || []);
      setOrders(ordersRes?.data || []);
      setLatestAssessment(latestRes?.data ?? null);
      setInProgressAssessment(inProgressRes?.data ?? null);
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
    retry: fetchDashboardData,
  };
}
