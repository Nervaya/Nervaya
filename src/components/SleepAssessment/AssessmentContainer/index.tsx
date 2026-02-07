'use client';

import { IoDocumentTextOutline } from 'react-icons/io5';
import ProgressBar from '../ProgressBar';
import { CompletionView } from './CompletionView';
import { AssessmentNav } from './AssessmentNav';
import { AssessmentQuestionStep } from './AssessmentQuestionStep';
import { useAssessmentState } from './useAssessmentState';
import styles from './styles.module.css';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';

interface AssessmentContainerProps {
  questions: ISleepAssessmentQuestion[];
}

export default function AssessmentContainer({ questions }: AssessmentContainerProps) {
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
    userWantsRetake,
    setUserWantsRetake,
    handleAnswerChange,
    handleNext,
    handlePrevious,
  } = useAssessmentState(questions);

  if (isComplete) {
    return <CompletionView completedResponse={completedResponse} />;
  }

  if (hasAlreadyCompleted && !userWantsRetake) {
    return (
      <CompletionView
        completedResponse={latestCompletedResponse}
        showRetakeActions
        onRetake={() => setUserWantsRetake(true)}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className={styles.emptyState} role="status">
        <div className={styles.emptyStateIcon} aria-hidden>
          <IoDocumentTextOutline />
        </div>
        <p className={styles.emptyStateText}>No questions available at the moment.</p>
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
