export type QuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'scale';

export interface IQuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface ISleepAssessmentQuestion {
  _id: string;
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  options: IQuestionOption[];
  order: number;
  isRequired: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestionAnswer {
  questionId: string;
  answer: string | string[];
}

export interface ISleepAssessmentResponse {
  _id: string;
  userId: string;
  answers: IQuestionAnswer[];
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuestionInput {
  questionText: string;
  questionType: QuestionType;
  options: IQuestionOption[];
  order: number;
  isRequired?: boolean;
  isActive?: boolean;
}

export interface UpdateQuestionInput {
  questionText?: string;
  questionType?: QuestionType;
  options?: IQuestionOption[];
  order?: number;
  isRequired?: boolean;
  isActive?: boolean;
  category?: string;
}

export interface SubmitAssessmentInput {
  answers: IQuestionAnswer[];
}

export interface SaveAnswerInput {
  questionId: string;
  answer: string | string[];
}
