'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ISleepAssessmentQuestion, ISleepAssessmentResponse } from '@/types/sleepAssessment.types';
import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '@/lib/utils/response.util';

export interface UseAssessmentStateResult {
  currentQuestion: ISleepAssessmentQuestion | undefined;
  currentQuestionIndex: number;
  totalQuestions: number;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  currentAnswer: string | string[] | null;
  canProceed: boolean;
  direction: number;
  isSubmitting: boolean;
  submitError: string | null;
  isComplete: boolean;
  completedResponse: ISleepAssessmentResponse | null;
  hasAlreadyCompleted: boolean;
  latestCompletedResponse: ISleepAssessmentResponse | null;
  userWantsRetake: boolean;
  setUserWantsRetake: (value: boolean) => void;
  isHydrated: boolean;
  handleAnswerChange: (answer: string | string[]) => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
}

export function useAssessmentState(questions: ISleepAssessmentQuestion[]): UseAssessmentStateResult {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string | string[]>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [completedResponse, setCompletedResponse] = useState<ISleepAssessmentResponse | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasAlreadyCompleted, setHasAlreadyCompleted] = useState(false);
  const [latestCompletedResponse, setLatestCompletedResponse] = useState<ISleepAssessmentResponse | null>(null);
  const [userWantsRetake, setUserWantsRetake] = useState(false);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const currentAnswer = useMemo(() => {
    if (!currentQuestion) return null;
    return answers.get(currentQuestion._id) ?? null;
  }, [currentQuestion, answers]);

  const canProceed = useMemo(() => {
    if (!currentQuestion) return false;
    if (!currentQuestion.isRequired) return true;
    const answer = answers.get(currentQuestion._id);
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return (answer as string).trim().length > 0;
  }, [currentQuestion, answers]);

  const handleAnswerChange = useCallback(
    (answer: string | string[]) => {
      if (!currentQuestion) return;
      setAnswers((prev) => {
        const newAnswers = new Map(prev);
        newAnswers.set(currentQuestion._id, answer);
        return newAnswers;
      });
    },
    [currentQuestion],
  );

  const saveCurrentAnswer = useCallback(async (questionId: string, answer: string | string[]) => {
    await axiosInstance.patch('/sleep-assessment/responses', {
      questionId,
      answer,
    });
  }, []);

  const COMPLETED_STORAGE_KEY = 'nervaya-sleep-assessment-completed';
  const COMPLETED_STORAGE_MAX_AGE_MS = 5000;

  const completeAssessment = useCallback(async (): Promise<ISleepAssessmentResponse | null> => {
    const response = await axiosInstance.post<unknown, ApiResponse<ISleepAssessmentResponse>>(
      '/sleep-assessment/responses/complete',
    );
    const data = response?.data ?? null;
    if (data) {
      try {
        sessionStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* ignore */
      }
    }
    return data;
  }, []);

  useEffect(() => {
    if (questions.length === 0 || isHydrated) return;

    const loadState = async () => {
      try {
        const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(COMPLETED_STORAGE_KEY) : null;
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as ISleepAssessmentResponse;
            const completedAt = parsed?.completedAt ? new Date(parsed.completedAt).getTime() : 0;
            if (completedAt && Date.now() - completedAt < COMPLETED_STORAGE_MAX_AGE_MS) {
              setCompletedResponse(parsed);
              setIsComplete(true);
              setIsHydrated(true);
              sessionStorage.removeItem(COMPLETED_STORAGE_KEY);
              return;
            }
          } catch {
            /* ignore */
          }
          sessionStorage.removeItem(COMPLETED_STORAGE_KEY);
        }

        const [inProgressRes, latestRes] = await Promise.all([
          axiosInstance.get<unknown, ApiResponse<ISleepAssessmentResponse | null>>(
            '/sleep-assessment/responses?inProgress=true',
          ),
          axiosInstance.get<unknown, ApiResponse<ISleepAssessmentResponse | null>>(
            '/sleep-assessment/responses?latest=true',
          ),
        ]);
        const inProgress = inProgressRes?.data ?? null;
        const latest = latestRes?.data ?? null;

        if (inProgress?.answers?.length) {
          const hydrated = new Map<string, string | string[]>();
          inProgress.answers.forEach((a: { questionId: string; answer: string | string[] }) => {
            const qid = typeof a.questionId === 'string' ? a.questionId : String(a.questionId);
            if (qid) hydrated.set(qid, a.answer);
          });
          setAnswers(hydrated);
          const firstUnansweredIndex = questions.findIndex((q) => !hydrated.has(q._id));
          if (firstUnansweredIndex >= 0) {
            setCurrentQuestionIndex(firstUnansweredIndex);
          }
        } else if (latest?.completedAt) {
          setHasAlreadyCompleted(true);
          setLatestCompletedResponse(latest);
        }
      } catch {
      } finally {
        setIsHydrated(true);
      }
    };

    loadState();
  }, [questions, isHydrated]);

  const handleNext = useCallback(async () => {
    if (!canProceed || !currentQuestion) return;

    const answerToSave = answers.get(currentQuestion._id);
    if (answerToSave === undefined && currentQuestion.isRequired) return;

    setDirection(1);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (answerToSave !== undefined) {
        await saveCurrentAnswer(currentQuestion._id, answerToSave);
      }
      if (isLastQuestion) {
        const response = await completeAssessment();
        setCompletedResponse(response ?? null);
        setIsComplete(true);
      } else {
        setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
      }
    } catch (error) {
      console.error('Failed to save answer:', error);
      setSubmitError('Failed to save your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [canProceed, currentQuestion, answers, isLastQuestion, totalQuestions, saveCurrentAnswer, completeAssessment]);

  const handlePrevious = useCallback(() => {
    if (isFirstQuestion) return;
    setDirection(-1);
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }, [isFirstQuestion]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canProceed && !isSubmitting) {
        e.preventDefault();
        handleNext();
      }
    },
    [canProceed, isSubmitting, handleNext],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    isFirstQuestion,
    isLastQuestion,
    currentAnswer,
    canProceed,
    direction,
    isSubmitting,
    submitError,
    isComplete,
    completedResponse,
    hasAlreadyCompleted,
    latestCompletedResponse,
    userWantsRetake,
    setUserWantsRetake,
    isHydrated,
    handleAnswerChange,
    handleNext,
    handlePrevious,
  };
}
