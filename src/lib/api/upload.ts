import api from '@/lib/axios';
import type { ApiResponse } from '@/lib/api/types';

export interface UploadResponse {
  url: string;
}

export const uploadApi = {
  image: (formData: FormData): Promise<ApiResponse<UploadResponse>> => {
    return api.post('/upload', formData) as Promise<ApiResponse<UploadResponse>>;
  },
};
