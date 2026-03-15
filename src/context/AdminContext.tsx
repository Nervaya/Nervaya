'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { adminStatsApi } from '@/lib/api/adminStats';
import type { DashboardStats } from '@/lib/services/adminStats.service';
import { useAuth } from '@/hooks/useAuth';

interface AdminContextType {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') return;
    setLoading(true);
    setError(null);
    try {
      const response = await adminStatsApi.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      refreshStats();
    }
  }, [user, refreshStats]);

  return (
    <AdminContext.Provider
      value={{
        stats,
        loading,
        error,
        refreshStats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
