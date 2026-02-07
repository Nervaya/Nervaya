'use client';

import Link from 'next/link';
import type { ISleepAssessmentResponse } from '@/types/sleepAssessment.types';
import { getSleepScoreLabel, NERVAYA_PICKS, MORE_FAVOURITES } from '@/lib/utils/sleepScore.util';
import styles from './SleepScoreSection.module.css';

interface SleepScoreSectionProps {
  latestAssessment: ISleepAssessmentResponse | null;
  loading?: boolean;
}

export function SleepScoreSection({ latestAssessment, loading = false }: SleepScoreSectionProps) {
  const hasCompletedAssessment = Boolean(latestAssessment?.completedAt);
  if (!hasCompletedAssessment && !loading) return null;

  const scoreLabel = loading ? '—' : getSleepScoreLabel(latestAssessment);

  return (
    <section className={styles.section} aria-labelledby="sleep-score-heading">
      <div className={styles.scoreRow}>
        <span className={styles.scoreLabel} id="sleep-score-heading">
          Your Sleep Quality Score:
        </span>
        <span className={styles.scoreBadge}>{scoreLabel}</span>
      </div>

      <div className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>Nervaya&apos;s Picks</h2>
        <ul className={styles.cardGrid} aria-label="Nervaya's Picks">
          {NERVAYA_PICKS.map((card) => (
            <li key={card.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
              <Link href={card.href} className={styles.cardButton}>
                {card.buttonText}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>More Favourites</h2>
        <ul className={styles.cardGrid} aria-label="More Favourites">
          {MORE_FAVOURITES.map((card) => (
            <li key={card.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
              <Link href={card.href} className={styles.cardButton}>
                {card.buttonText}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <Link href="/sleep-assessment" className={styles.primaryLink}>
          View full results / Retake assessment
        </Link>
      </div>
    </section>
  );
}
