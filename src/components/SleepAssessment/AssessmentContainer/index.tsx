'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ProgressBar from '../ProgressBar';
import { CompletionView } from './CompletionView';
import { AssessmentNav } from './AssessmentNav';
import { AssessmentQuestionStep } from './AssessmentQuestionStep';
import styles from './styles.module.css';
import type { ISleepAssessmentQuestion, IQuestionAnswer } from '@/types/sleepAssessment.types';
import axiosInstance from '@/lib/axios';

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

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const formattedAnswers: IQuestionAnswer[] = [];
      answers.forEach((answer, questionId) => {
        const question = questions.find((q) => q._id === questionId);
        if (question) {
          formattedAnswers.push({
            questionId,
            questionKey: question.questionKey,
            answer,
          });
        }
      });
      await axiosInstance.post('/sleep-assessment/responses', { answers: formattedAnswers });
      setIsComplete(true);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      setSubmitError('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, questions]);

  const handleNext = useCallback(() => {
    if (!canProceed) return;
    setDirection(1);
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
    }
  }, [canProceed, isLastQuestion, totalQuestions, handleSubmit]);

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
      </header>

      <ProgressBar currentStep={currentQuestionIndex + 1} totalSteps={totalQuestions} />

      <AssessmentQuestionStep
        question={currentQuestion}
        direction={direction}
        currentAnswer={currentAnswer}
        onAnswerChange={handleAnswerChange}
      />

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
