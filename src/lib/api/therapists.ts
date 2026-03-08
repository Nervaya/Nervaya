import api from '@/lib/axios';
import type { ApiResponse } from '@/lib/api/types';
import type { Therapist } from '@/types/therapist.types';

export interface CreateTherapistData {
  name: string;
  slug?: string;
  email?: string;
  qualifications?: string[];
  experience?: string;
  gender?: 'male' | 'female' | 'other';
  languages?: string[];
  specializations?: string[];
  image?: string;
  introVideoUrl?: string;
  introVideoThumbnail?: string;
  galleryImages?: string[];
  bio?: string;
  bioLong?: string;
  quote?: string;
  messageToClient?: string;
  sessionFee?: number;
  sessionDurationMins?: number;
  sessionModes?: string[];
  testimonials?: Array<{
    name: string;
    message: string;
    clientSince?: string;
  }>;
  consultingHours?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isEnabled: boolean;
  }>;
}

export const therapistsApi = {
  getAll: (): Promise<ApiResponse<Therapist[]>> => {
    return api.get('/therapists') as Promise<ApiResponse<Therapist[]>>;
  },

  getById: (id: string): Promise<ApiResponse<Therapist>> => {
    return api.get(`/therapists/${id}`) as Promise<ApiResponse<Therapist>>;
  },

  create: (data: CreateTherapistData): Promise<ApiResponse<Therapist>> => {
    return api.post('/therapists', data) as Promise<ApiResponse<Therapist>>;
  },

  update: (id: string, data: Partial<CreateTherapistData>): Promise<ApiResponse<Therapist>> => {
    return api.put(`/therapists/${id}`, data) as Promise<ApiResponse<Therapist>>;
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`/therapists/${id}`) as Promise<ApiResponse<null>>;
  },
};
