import api from '@/lib/axios';
import type { ApiResponse } from '@/lib/api/types';

export interface DriftOffQuestion {
  _id: string;
  questionId: string;
  questionText: string;
  questionType: string;
  options?: Array<{ id: string; value: string; label: string }>;
  order: number;
  isRequired?: boolean;
  isActive?: boolean;
}

export interface CreateDriftOffQuestionData {
  questionText: string;
  questionType: string;
  options: Array<{ id?: string; value: string; label: string }>;
  order: number;
  isRequired?: boolean;
  isActive?: boolean;
}

export const driftOffQuestionsApi = {
  getQuestions: (includeInactive = false): Promise<ApiResponse<DriftOffQuestion[]>> => {
    const params = includeInactive ? '?includeInactive=true' : '';
    return api.get(`/drift-off/questions${params}`) as Promise<ApiResponse<DriftOffQuestion[]>>;
  },

  getQuestionById: (id: string): Promise<ApiResponse<DriftOffQuestion>> => {
    return api.get(`/drift-off/questions/${id}`) as Promise<ApiResponse<DriftOffQuestion>>;
  },

  createQuestion: (data: CreateDriftOffQuestionData): Promise<ApiResponse<DriftOffQuestion>> => {
    return api.post('/drift-off/questions', data) as Promise<ApiResponse<DriftOffQuestion>>;
  },

  updateQuestion: (id: string, data: Partial<CreateDriftOffQuestionData>): Promise<ApiResponse<DriftOffQuestion>> => {
    return api.put(`/drift-off/questions/${id}`, data) as Promise<ApiResponse<DriftOffQuestion>>;
  },

  deleteQuestion: (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`/drift-off/questions/${id}`) as Promise<ApiResponse<null>>;
  },
};
