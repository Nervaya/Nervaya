import api from '@/lib/axios';
import type { Supplement } from '@/types/supplement.types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const supplementsApi = {
  getAll: (): Promise<ApiResponse<Supplement[]>> => {
    return api.get('/supplements') as Promise<ApiResponse<Supplement[]>>;
  },

  getById: (id: string): Promise<ApiResponse<Supplement>> => {
    return api.get(`/supplements/${id}`) as Promise<ApiResponse<Supplement>>;
  },
};
