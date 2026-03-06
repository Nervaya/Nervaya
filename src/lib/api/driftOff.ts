import api from '@/lib/axios';
import type { ApiResponse } from '@/lib/api/types';
import type { IDriftOffOrder, IDriftOffResponse } from '@/types/driftOff.types';

export const driftOffApi = {
  createOrder: (): Promise<ApiResponse<IDriftOffOrder>> =>
    api.post('/drift-off/orders') as Promise<ApiResponse<IDriftOffOrder>>,

  getOrder: (id: string): Promise<ApiResponse<IDriftOffOrder>> =>
    api.get(`/drift-off/orders/${id}`) as Promise<ApiResponse<IDriftOffOrder>>,

  createRazorpayOrder: (
    driftOffOrderId: string,
  ): Promise<ApiResponse<{ id: string; amount: number; currency: string; key_id: string }>> =>
    api.post('/payments/drift-off/create-order', { driftOffOrderId }) as Promise<
      ApiResponse<{ id: string; amount: number; currency: string; key_id: string }>
    >,

  verifyPayment: (body: {
    driftOffOrderId: string;
    paymentId: string;
    razorpaySignature: string;
  }): Promise<ApiResponse<{ verified: boolean; orderId: string }>> =>
    api.post('/payments/drift-off/verify', body) as Promise<ApiResponse<{ verified: boolean; orderId: string }>>,

  getResponses: (): Promise<ApiResponse<IDriftOffResponse[]>> =>
    api.get('/drift-off/responses') as Promise<ApiResponse<IDriftOffResponse[]>>,

  saveAnswer: (body: {
    driftOffOrderId: string;
    questionId: string;
    answer: string | string[];
  }): Promise<ApiResponse<IDriftOffResponse>> =>
    api.post('/drift-off/responses', body) as Promise<ApiResponse<IDriftOffResponse>>,

  completeAssessment: (driftOffOrderId: string): Promise<ApiResponse<IDriftOffResponse>> =>
    api.post('/drift-off/responses/complete', { driftOffOrderId }) as Promise<ApiResponse<IDriftOffResponse>>,

  getAllResponsesAdmin: (): Promise<ApiResponse<IDriftOffResponse[]>> =>
    api.get('/admin/drift-off/responses') as Promise<ApiResponse<IDriftOffResponse[]>>,

  assignVideo: (responseId: string, videoUrl: string): Promise<ApiResponse<IDriftOffResponse>> =>
    api.put(`/admin/drift-off/responses/${responseId}/assign-video`, { videoUrl }) as Promise<
      ApiResponse<IDriftOffResponse>
    >,
};
