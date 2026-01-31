'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ProgressBar from '../ProgressBar';
import { CompletionView } from './CompletionView';
import { AssessmentNav } from './AssessmentNav';
import { AssessmentQuestionStep } from './AssessmentQuestionStep';
import styles from './styles.module.css';
import type { ISleepAssessmentQuestion, ISleepAssessmentResponse } from '@/types/sleepAssessment.types';
import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '@/lib/utils/response.util';

interface AssessmentContainerProps {
  questions: ISleepAssessmentQuestion[];
}

const AssessmentContainer = ({ questions }: AssessmentContainerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string | string[]>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

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

  const completeAssessment = useCallback(async () => {
    await axiosInstance.post('/sleep-assessment/responses/complete');
  }, []);

  useEffect(() => {
    if (questions.length === 0 || isHydrated) return;

    const loadInProgress = async () => {
      try {
        const response = await axiosInstance.get<unknown, ApiResponse<ISleepAssessmentResponse | null>>(
          '/sleep-assessment/responses?inProgress=true',
        );
        const inProgress = response.data;
        if (inProgress?.answers?.length) {
          const hydrated = new Map<string, string | string[]>();
          inProgress.answers.forEach((a) => {
            const qid = typeof a.questionId === 'string' ? a.questionId : String(a.questionId);
            if (qid) hydrated.set(qid, a.answer);
          });
          setAnswers(hydrated);
          const firstUnansweredIndex = questions.findIndex((q) => !hydrated.has(q._id));
          if (firstUnansweredIndex >= 0) {
            setCurrentQuestionIndex(firstUnansweredIndex);
          }
        }
      } catch {
      } finally {
        setIsHydrated(true);
      }
    };

    loadInProgress();
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
        await completeAssessment();
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

  if (isComplete) {
    return <CompletionView />;
  }

  if (!currentQuestion) {
    return (
      <div className={styles.emptyState}>
        <p>No questions available at the moment.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Sleep Assessment</h1>
        <span className={styles.stepCounter} aria-hidden="true">
          {currentQuestionIndex + 1}/{totalQuestions}
        </span>
      </header>

      <div className={styles.progressSection}>
        <ProgressBar
          currentStep={currentQuestionIndex + 1}
          totalSteps={totalQuestions}
          showStepCounter={false}
        />
      </div>

      <section className={styles.questionSection} aria-label="Current question">
        <AssessmentQuestionStep
          question={currentQuestion}
          direction={direction}
          currentAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
        />
      </section>

      {submitError && (
        <div className={styles.errorMessage} role="alert">
          {submitError}
        </div>
      )}

      <AssessmentNav
        isFirstQuestion={isFirstQuestion}
        isLastQuestion={isLastQuestion}
        canProceed={canProceed}
        isSubmitting={isSubmitting}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
};

export default AssessmentContainer;
