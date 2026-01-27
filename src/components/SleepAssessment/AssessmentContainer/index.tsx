'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LazyMotion, m, AnimatePresence } from 'framer-motion';
import ProgressBar from '../ProgressBar';
import QuestionCard from '../QuestionCard';
import Loader from '@/components/common/Loader';
import styles from './styles.module.css';
import type { ISleepAssessmentQuestion, IQuestionAnswer } from '@/types/sleepAssessment.types';
import axiosInstance from '@/lib/axios';

interface AssessmentContainerProps {
  questions: ISleepAssessmentQuestion[];
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

const AssessmentContainer = ({ questions }: AssessmentContainerProps) => {
  const router = useRouter();
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
    if (!currentQuestion) {
      return null;
    }
    return answers.get(currentQuestion._id) ?? null;
  }, [currentQuestion, answers]);

  const canProceed = useMemo(() => {
    if (!currentQuestion) {
      return false;
    }
    if (!currentQuestion.isRequired) {
      return true;
    }

    const answer = answers.get(currentQuestion._id);
    if (!answer) {
      return false;
    }

    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    return answer.trim().length > 0;
  }, [currentQuestion, answers]);

  const handleAnswerChange = useCallback(
    (answer: string | string[]) => {
      if (!currentQuestion) {
        return;
      }

      setAnswers((prev) => {
        const newAnswers = new Map(prev);
        newAnswers.set(currentQuestion._id, answer);
        return newAnswers;
      });
    },
    [currentQuestion],
  );

  const handleNext = useCallback(() => {
    if (!canProceed) {
      return;
    }

    setDirection(1);
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
    }
  }, [canProceed, isLastQuestion, totalQuestions, handleSubmit]);

  const handlePrevious = useCallback(() => {
    if (isFirstQuestion) {
      return;
    }

    setDirection(-1);
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }, [isFirstQuestion]);

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

      await axiosInstance.post('/sleep-assessment/responses', {
        answers: formattedAnswers,
      });

      setIsComplete(true);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      setSubmitError('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, questions]);

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
    return (
      <div className={styles.completionContainer}>
        <div className={styles.completionIcon}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M8 12L11 15L16 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className={styles.completionTitle}>Assessment Complete!</h2>
        <p className={styles.completionText}>
          Thank you for completing the sleep assessment. Your responses have been saved and will help us personalize
          your sleep journey.
        </p>
        <button type="button" className={styles.completionButton} onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </button>
      </div>
    );
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

      <LazyMotion features={() => import('framer-motion').then((mod) => mod.domAnimation)}>
        <div className={styles.questionWrapper}>
          <AnimatePresence mode="wait" custom={direction}>
            <m.div
              key={currentQuestion._id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              <QuestionCard
                questionText={currentQuestion.questionText}
                questionType={currentQuestion.questionType}
                options={currentQuestion.options}
                selectedAnswer={currentAnswer}
                onAnswerChange={handleAnswerChange}
                isRequired={currentQuestion.isRequired}
              />
            </m.div>
          </AnimatePresence>
        </div>
      </LazyMotion>

      {submitError && (
        <div className={styles.errorMessage} role="alert">
          {submitError}
        </div>
      )}

      <footer className={styles.footer}>
        <button
          type="button"
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={handlePrevious}
          disabled={isFirstQuestion || isSubmitting}
          aria-label="Previous question"
        >
          Previous
        </button>
        <button
          type="button"
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          aria-label={isLastQuestion ? 'Submit assessment' : 'Next question'}
        >
          {isSubmitting ? <Loader size="sm" color="white" /> : isLastQuestion ? 'Submit' : 'Next Question'}
        </button>
      </footer>
    </div>
  );
};

export default AssessmentContainer;
