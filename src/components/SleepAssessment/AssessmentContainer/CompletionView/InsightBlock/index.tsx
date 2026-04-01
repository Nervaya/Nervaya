import styles from './styles.module.css';

interface InsightBlockProps {
  segmentLabel: string;
  dotColor: string;
  headline: string;
  insight: string;
  reassurance: string;
  actionFraming: string;
}

export function InsightBlock({
  segmentLabel,
  dotColor,
  headline,
  insight,
  reassurance,
  actionFraming,
}: InsightBlockProps) {
  return (
    <section className={styles.block}>
      <div className={styles.badge}>
        <span className={styles.dot} style={{ background: dotColor }} />
        <span className={styles.label}>{segmentLabel}</span>
      </div>
      <h2 className={styles.headline}>{headline}</h2>
      <p className={styles.body}>{insight}</p>
      <p className={styles.italic}>{reassurance}</p>
      <p className={styles.accent}>{actionFraming}</p>
    </section>
  );
}
