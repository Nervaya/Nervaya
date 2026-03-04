import Link from 'next/link';
import styles from './styles.module.css';

const DriftOffCompletionView = () => (
  <div className={styles.container}>
    <div className={styles.iconWrapper} aria-hidden>
      <span className={styles.icon}>🎧</span>
    </div>
    <h2 className={styles.title}>You&apos;re all set!</h2>
    <p className={styles.message}>
      Thank you for completing the assessment. Our specialists will review your answers and curate a personalized
      25-minute Deep Rest Session just for you.
    </p>
    <p className={styles.subMessage}>You&apos;ll be notified once your session is ready — usually within 1–2 days.</p>
    <div className={styles.actions}>
      <Link href="/drift-off/my-session" className={styles.btnPrimary}>
        Check My Session
      </Link>
      <Link href="/dashboard" className={styles.btnSecondary}>
        Go to Dashboard
      </Link>
    </div>
  </div>
);

export default DriftOffCompletionView;
