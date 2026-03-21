import api from '@/lib/axios';
import type { ApiResponse } from '@/lib/api/types';
import type { IDeepRestOrder, IDeepRestResponse } from '@/types/deepRest.types';

export const deepRestApi = {
  createOrder: (): Promise<ApiResponse<IDeepRestOrder>> =>
    api.post('/deep-rest/orders') as Promise<ApiResponse<IDeepRestOrder>>,

  getOrder: (id: string): Promise<ApiResponse<IDeepRestOrder>> =>
    api.get(`/deep-rest/orders/${id}`) as Promise<ApiResponse<IDeepRestOrder>>,

  createRazorpayOrder: (
    deepRestOrderId: string,
  ): Promise<ApiResponse<{ id: string; amount: number; currency: string; key_id: string }>> =>
    api.post('/payments/deep-rest/create-order', { driftOffOrderId: deepRestOrderId }) as Promise<
      ApiResponse<{ id: string; amount: number; currency: string; key_id: string }>
    >,

  verifyPayment: (body: {
    deepRestOrderId: string;
    paymentId: string;
    razorpaySignature: string;
  }): Promise<ApiResponse<{ verified: boolean; orderId: string }>> =>
    api.post('/payments/deep-rest/verify', {
      driftOffOrderId: body.deepRestOrderId,
      paymentId: body.paymentId,
      razorpaySignature: body.razorpaySignature,
    }) as Promise<ApiResponse<{ verified: boolean; orderId: string }>>,

  getResponses: (): Promise<ApiResponse<IDeepRestResponse[]>> =>
    api.get(`/deep-rest/responses?t=${Date.now()}`) as Promise<ApiResponse<IDeepRestResponse[]>>,

  saveAnswer: (body: {
    deepRestOrderId: string;
    questionId: string;
    answer: string | string[];
  }): Promise<ApiResponse<IDeepRestResponse>> =>
    api.post('/deep-rest/responses', {
      driftOffOrderId: body.deepRestOrderId,
      questionId: body.questionId,
      answer: body.answer,
    }) as Promise<ApiResponse<IDeepRestResponse>>,

  completeAssessment: (deepRestOrderId: string): Promise<ApiResponse<IDeepRestResponse>> =>
    api.post('/deep-rest/responses/complete', { driftOffOrderId: deepRestOrderId }) as Promise<
      ApiResponse<IDeepRestResponse>
    >,

  getAllResponsesAdmin: (): Promise<ApiResponse<IDeepRestResponse[]>> =>
    api.get('/admin/deep-rest/responses') as Promise<ApiResponse<IDeepRestResponse[]>>,

  assignVideo: (responseId: string, videoUrl: string): Promise<ApiResponse<IDeepRestResponse>> =>
    api.put(`/admin/deep-rest/responses/${responseId}/assign-video`, { videoUrl }) as Promise<
      ApiResponse<IDeepRestResponse>
    >,

  requestReSession: (responseId: string): Promise<ApiResponse<IDeepRestResponse>> =>
    api.post(`/deep-rest/responses/${responseId}/request-re-session`) as Promise<ApiResponse<IDeepRestResponse>>,
};
