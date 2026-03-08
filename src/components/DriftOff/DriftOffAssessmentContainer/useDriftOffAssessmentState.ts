'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import { driftOffApi } from '@/lib/api/driftOff';
import type { IDriftOffAnswer } from '@/types/driftOff.types';

export interface UseDriftOffAssessmentResult {
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
  isHydrated: boolean;
  handleAnswerChange: (answer: string | string[]) => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
}

export function useDriftOffAssessmentState(
  questions: ISleepAssessmentQuestion[],
  driftOffOrderId: string,
  initialAnswers: IDriftOffAnswer[] = [],
): UseDriftOffAssessmentResult {
  const hydratedInitialAnswersRef = useRef(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string | string[]>>(
    () => new Map(initialAnswers.map((a) => [a.questionId, a.answer])),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isHydrated] = useState(true);

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
    return answer.trim().length > 0;
  }, [currentQuestion, answers]);

  useEffect(() => {
    if (hydratedInitialAnswersRef.current || questions.length === 0) return;

    const hydrated = new Map<string, string | string[]>(initialAnswers.map((a) => [a.questionId, a.answer]));
    setAnswers(hydrated);

    if (hydrated.size > 0) {
      const firstUnanswered = questions.findIndex((q) => !hydrated.has(q._id));
      if (firstUnanswered >= 0) setCurrentQuestionIndex(firstUnanswered);
    }

    hydratedInitialAnswersRef.current = true;
  }, [questions, initialAnswers]);

  const handleAnswerChange = useCallback(
    (answer: string | string[]) => {
      if (!currentQuestion) return;
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(currentQuestion._id, answer);
        return next;
      });
    },
    [currentQuestion],
  );

  const handleNext = useCallback(async () => {
    if (!canProceed || !currentQuestion) return;
    const answerToSave = answers.get(currentQuestion._id);
    if (answerToSave === undefined && currentQuestion.isRequired) return;

    setDirection(1);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (answerToSave !== undefined) {
        await driftOffApi.saveAnswer({
          driftOffOrderId,
          questionId: currentQuestion._id,
          answer: answerToSave,
        });
      }
      if (isLastQuestion) {
        await driftOffApi.completeAssessment(driftOffOrderId);
        setIsComplete(true);
      } else {
        setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
      }
    } catch {
      setSubmitError('Failed to save your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [canProceed, currentQuestion, answers, isLastQuestion, totalQuestions, driftOffOrderId]);

  const handlePrevious = useCallback(() => {
    if (isFirstQuestion) return;
    setDirection(-1);
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }, [isFirstQuestion]);

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
    isHydrated,
    handleAnswerChange,
    handleNext,
    handlePrevious,
  };
}
