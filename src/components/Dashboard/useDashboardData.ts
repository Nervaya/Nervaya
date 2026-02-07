'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@/types/session.types';
import type { Order } from '@/types/supplement.types';
import type { ISleepAssessmentResponse } from '@/types/sleepAssessment.types';

interface DashboardApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

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
        fetch('/api/sessions').then((r) => r.json() as Promise<DashboardApiResponse<Session[]>>),
        fetch('/api/orders').then((r) => r.json() as Promise<DashboardApiResponse<Order[]>>),
        fetch('/api/sleep-assessment/responses?latest=true').then(
          (r) => r.json() as Promise<DashboardApiResponse<ISleepAssessmentResponse | null>>,
        ),
        fetch('/api/sleep-assessment/responses?inProgress=true').then(
          (r) => r.json() as Promise<DashboardApiResponse<ISleepAssessmentResponse | null>>,
        ),
      ]);

      setSessions(sessionsRes?.data || []);
      setOrders(ordersRes?.data || []);
      setLatestAssessment(latestRes?.data || null);
      setInProgressAssessment(inProgressRes?.data || null);
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
