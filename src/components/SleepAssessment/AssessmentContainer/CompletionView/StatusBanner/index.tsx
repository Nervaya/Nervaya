import type { SeverityLevel } from '@/utils/sleepAssessment';
import styles from './styles.module.css';

interface StatusBannerProps {
  status: string;
  severityLevel: SeverityLevel;
}

const SEVERITY_CLASS: Record<SeverityLevel, string> = {
  mild: styles.mild,
  moderate: styles.moderate,
  severe: styles.severe,
  none: styles.none,
};

export function StatusBanner({ status, severityLevel }: StatusBannerProps) {
  return (
    <section className={`${styles.banner} ${SEVERITY_CLASS[severityLevel]}`}>
      <span className={styles.tag}>SLEEP ASSESSMENT</span>
      <h1 className={styles.title}>{status}</h1>
      <p className={styles.sub}>Based on your responses, here is what we found.</p>
    </section>
  );
}
