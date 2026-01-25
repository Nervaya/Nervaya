export type QuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'scale';

export interface IQuestionOption {
    id: string;
    label: string;
    value: string;
}

export interface ISleepAssessmentQuestion {
    _id: string;
    questionId: string;
    questionKey: string;
    questionText: string;
    questionType: QuestionType;
    options: IQuestionOption[];
    order: number;
    isRequired: boolean;
    isActive: boolean;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IQuestionAnswer {
    questionId: string;
    questionKey: string;
    answer: string | string[];
}

export interface ISleepAssessmentResponse {
    _id: string;
    userId: string;
    answers: IQuestionAnswer[];
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateQuestionInput {
    questionKey: string;
    questionText: string;
    questionType: QuestionType;
    options: IQuestionOption[];
    order: number;
    isRequired?: boolean;
    isActive?: boolean;
    category?: string;
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
