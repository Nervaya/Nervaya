import api from '@/lib/axios';

export interface AdminFeedbackFiltersParams {
  minScore?: number;
  maxScore?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminFeedback {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  score: number;
  comment: string;
  pageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFeedbackResponse {
  data: AdminFeedback[];
  meta: PaginationMeta;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const adminFeedbackApi = {
  getAll: (
    page: number,
    limit: number,
    filters?: AdminFeedbackFiltersParams,
  ): Promise<ApiResponse<AdminFeedbackResponse>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (filters?.minScore !== undefined) params.set('minScore', String(filters.minScore));
    if (filters?.maxScore !== undefined) params.set('maxScore', String(filters.maxScore));
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);
    return api.get(`/admin/feedback?${params.toString()}`) as Promise<ApiResponse<AdminFeedbackResponse>>;
  },
};
