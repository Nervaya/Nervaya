'use client';

import { Icon } from '@iconify/react';
import { ICON_DOCUMENT } from '@/constants/icons';
import ProgressBar from '../ProgressBar';
import { CompletionView } from './CompletionView';
import { AssessmentNav } from './AssessmentNav';
import { AssessmentQuestionStep } from './AssessmentQuestionStep';
import { useAssessmentState } from './useAssessmentState';
import styles from './styles.module.css';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';

interface AssessmentContainerProps {
  questions: ISleepAssessmentQuestion[];
  onHydrated?: () => void;
}

export default function AssessmentContainer({ questions, onHydrated }: AssessmentContainerProps) {
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
    completedResponse,
    hasAlreadyCompleted,
    latestCompletedResponse,
    isHydrated,
    handleAnswerChange,
    handleNext,
    handlePrevious,
  } = useAssessmentState(questions, onHydrated);

  if (!isHydrated) {
    return null;
  }

  if (isComplete) {
    return <CompletionView completedResponse={completedResponse} questions={questions} />;
  }

  if (hasAlreadyCompleted) {
    return <CompletionView completedResponse={latestCompletedResponse} questions={questions} />;
  }

  if (!currentQuestion) {
    return (
      <div className={styles.emptyState} role="status">
        <div className={styles.emptyStateIcon} aria-hidden>
          <Icon icon={ICON_DOCUMENT} width={48} height={48} />
        </div>
        <p className={styles.emptyStateText}>No questions available at the moment.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Sleep Assessment</h1>
      </header>

      <div className={styles.progressSection}>
        <ProgressBar currentStep={currentQuestionIndex + 1} totalSteps={totalQuestions} showStepCounter={true} />
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
