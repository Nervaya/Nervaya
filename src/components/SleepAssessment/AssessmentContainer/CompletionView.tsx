'use client';

import { useRouter } from 'next/navigation';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import styles from './styles.module.css';

export function CompletionView() {
  const router = useRouter();

  return (
    <div className={styles.completionContainer}>
      <div className={styles.completionIcon}>
        <IoCheckmarkCircleOutline aria-hidden />
      </div>
      <h2 className={styles.completionTitle}>Assessment Complete!</h2>
      <p className={styles.completionText}>
        Thank you for completing the sleep assessment. Your responses have been saved and will help us personalize your
        sleep journey.
      </p>
      <button type="button" className={styles.completionButton} onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </button>
    </div>
  );
}
