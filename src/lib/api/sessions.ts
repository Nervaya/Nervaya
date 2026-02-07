import api from '@/lib/axios';
import type { Session } from '@/types/session.types';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AdminSessionsResponse {
  data: Session[];
  meta: PaginationMeta;
}

export interface SessionFiltersParams {
  status?: string;
  therapistId?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

export const sessionsApi = {
  getAllForAdmin: (
    page: number = 1,
    limit: number = 10,
    filters?: SessionFiltersParams,
  ): Promise<ApiResponse<AdminSessionsResponse>> => {
    const params = new URLSearchParams({ admin: 'true', page: String(page), limit: String(limit) });
    if (filters?.status) params.set('status', filters.status);
    if (filters?.therapistId) params.set('therapistId', filters.therapistId);
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);
    if (filters?.userId) params.set('userId', filters.userId);
    return api.get(`/sessions?${params.toString()}`) as Promise<ApiResponse<AdminSessionsResponse>>;
  },
};
