import api from '@/lib/axios';
import type { Supplement } from '@/types/supplement.types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const supplementsApi = {
  getAll: (category?: string): Promise<ApiResponse<Supplement[]>> => {
    const params = category ? { category } : undefined;
    return api.get('/supplements', { params }) as Promise<ApiResponse<Supplement[]>>;
  },

  getById: (id: string): Promise<ApiResponse<Supplement>> => {
    return api.get(`/supplements/${id}`) as Promise<ApiResponse<Supplement>>;
  },
};
