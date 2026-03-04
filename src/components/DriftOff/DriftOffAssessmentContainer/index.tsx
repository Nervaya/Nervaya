'use client';

import ProgressBar from '@/components/SleepAssessment/ProgressBar';
import { AssessmentQuestionStep } from '@/components/SleepAssessment/AssessmentContainer/AssessmentQuestionStep';
import { AssessmentNav } from '@/components/SleepAssessment/AssessmentContainer/AssessmentNav';
import LottieLoader from '@/components/common/LottieLoader';
import DriftOffCompletionView from './DriftOffCompletionView';
import { useDriftOffAssessmentState } from './useDriftOffAssessmentState';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import styles from './styles.module.css';

interface DriftOffAssessmentContainerProps {
  questions: ISleepAssessmentQuestion[];
  driftOffOrderId: string;
}

export default function DriftOffAssessmentContainer({ questions, driftOffOrderId }: DriftOffAssessmentContainerProps) {
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
  } = useDriftOffAssessmentState(questions, driftOffOrderId);

  if (!isHydrated) {
    return (
      <div className={styles.loading} aria-busy="true">
        <LottieLoader width={160} height={160} />
        <p className={styles.loadingText}>Loading your assessment…</p>
      </div>
    );
  }

  if (isComplete) {
    return <DriftOffCompletionView />;
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
        <h1 className={styles.title}>Deep Rest Session Assessment</h1>
        <span className={styles.stepCounter} aria-hidden>
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
