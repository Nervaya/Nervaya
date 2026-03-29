'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/SleepAssessment/ProgressBar';
import { AssessmentQuestionStep } from '@/components/SleepAssessment/AssessmentContainer/AssessmentQuestionStep';
import { AssessmentNav } from '@/components/SleepAssessment/AssessmentContainer/AssessmentNav';
import { GlobalLoader } from '@/components/common/GlobalLoader';
import { useDriftOffAssessmentState } from './useDriftOffAssessmentState';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import type { IDriftOffAnswer } from '@/types/driftOff.types';
import styles from './styles.module.css';

interface DriftOffAssessmentContainerProps {
  questions: ISleepAssessmentQuestion[];
  driftOffOrderId: string;
  initialAnswers?: IDriftOffAnswer[];
  responseId?: string | null;
  isReSession?: boolean;
}

export default function DriftOffAssessmentContainer({
  questions,
  driftOffOrderId,
  initialAnswers = [],
  responseId = null,
  isReSession = false,
}: DriftOffAssessmentContainerProps) {
  const router = useRouter();

  const {
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
  } = useDriftOffAssessmentState(questions, driftOffOrderId, initialAnswers, isReSession, responseId);

  // We no longer use global showLoader() here to avoid double/hovering spinners

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        router.replace('/deep-rest/sessions');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, router]);

  if (!isHydrated) {
    return <GlobalLoader label="Loading your questionnaire..." />;
  }

  if (isComplete) {
    return <GlobalLoader label="Redirecting to your session..." />;
  }

  if (!currentQuestion) {
    return (
      <p className={styles.empty} role="status">
        No questions available at the moment.
      </p>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Deep Rest Audio Questionnaire</h1>
        <span className={styles.stepCounter} aria-hidden>
          {currentQuestionIndex + 1}/{totalQuestions}
        </span>
      </header>

      <div className={styles.oneTimeNote} role="status">
        <p>
          This assessment can only be taken once. We do this to ensure the authenticity of your responses. Your
          responses will be saved and our specialists will use them to curate your personalized session.
        </p>
      </div>

      <div className={styles.progressSection}>
        <ProgressBar currentStep={currentQuestionIndex + 1} totalSteps={totalQuestions} showStepCounter={false} />
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
}
