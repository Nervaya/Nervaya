'use client';

import LottieLoader from '@/components/common/LottieLoader';
import styles from './styles.module.css';

interface AssessmentNavProps {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  canProceed: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function AssessmentNav({
  isFirstQuestion,
  isLastQuestion,
  canProceed,
  isSubmitting,
  onPrevious,
  onNext,
}: AssessmentNavProps) {
  return (
    <footer className={styles.footer}>
      <button
        type="button"
        className={`${styles.navButton} ${styles.prevButton}`}
        onClick={onPrevious}
        disabled={isFirstQuestion || isSubmitting}
        aria-label="Previous question"
      >
        Previous
      </button>
      <button
        type="button"
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        aria-label={isLastQuestion ? 'Submit assessment' : 'Next question'}
      >
        {isSubmitting ? <LottieLoader width={50} height={50} /> : isLastQuestion ? 'Submit' : 'Next Question'}
      </button>
    </footer>
  );
}
