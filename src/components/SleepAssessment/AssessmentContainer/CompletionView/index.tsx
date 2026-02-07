'use client';

import Link from 'next/link';
import type { ISleepAssessmentResponse } from '@/types/sleepAssessment.types';
import { getSleepScoreLabel, NERVAYA_PICKS, MORE_FAVOURITES } from '@/lib/utils/sleepScore.util';
import styles from './styles.module.css';

interface CompletionViewProps {
  completedResponse?: ISleepAssessmentResponse | null;
  showRetakeActions?: boolean;
  onRetake?: () => void;
}

export function CompletionView({ completedResponse = null, showRetakeActions = false, onRetake }: CompletionViewProps) {
  const scoreLabel = getSleepScoreLabel(completedResponse);

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.scoreRow}>
        <span className={styles.scoreLabel}>Your Sleep Quality Score:</span>
        <span className={styles.scoreBadge}>{scoreLabel}</span>
      </div>

      <section className={styles.section} aria-labelledby="nervaya-picks-heading">
        <h2 id="nervaya-picks-heading" className={styles.sectionHeading}>
          Nervaya&apos;s Picks
        </h2>
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
      </section>

      <section className={styles.section} aria-labelledby="more-favourites-heading">
        <h2 id="more-favourites-heading" className={styles.sectionHeading}>
          More Favourites
        </h2>
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
      </section>

      <div className={styles.actions}>
        {showRetakeActions && onRetake ? (
          <>
            <button type="button" className={styles.primaryButton} onClick={onRetake}>
              Retake sleep assessment
            </button>
            <Link href="/dashboard" className={styles.secondaryButton}>
              Go to Dashboard
            </Link>
          </>
        ) : (
          <Link href="/dashboard" className={styles.primaryButton}>
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
