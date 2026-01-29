import api from '@/lib/axios';
import type { Cart } from '@/types/supplement.types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const cartApi = {
  get: (): Promise<ApiResponse<Cart>> => {
    return api.get('/cart') as Promise<ApiResponse<Cart>>;
  },

  add: (supplementId: string, quantity: number): Promise<ApiResponse<Cart>> => {
    return api.post('/cart', { supplementId, quantity }) as Promise<ApiResponse<Cart>>;
  },

  update: (supplementId: string, quantity: number): Promise<ApiResponse<Cart>> => {
    return api.put('/cart', { supplementId, quantity }) as Promise<ApiResponse<Cart>>;
  },

  remove: (supplementId: string): Promise<ApiResponse<Cart>> => {
    return api.delete(`/cart?supplementId=${supplementId}`) as Promise<ApiResponse<Cart>>;
  },
};
