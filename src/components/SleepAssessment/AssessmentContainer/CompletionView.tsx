'use client';

import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export function CompletionView() {
  const router = useRouter();

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
