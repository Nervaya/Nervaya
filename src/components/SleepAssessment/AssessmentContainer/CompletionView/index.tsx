'use client';

import Link from 'next/link';
import type { ISleepAssessmentResponse } from '@/types/sleepAssessment.types';
import { getSleepAssessmentResult, getSleepScoreLabel } from '@/lib/utils/sleepScore.util';
import { trackRecommendationClicked } from '@/utils/analytics';
import { Badge } from '@/components/common';
import styles from './styles.module.css';

interface CompletionViewProps {
  completedResponse?: ISleepAssessmentResponse | null;
}

export function CompletionView({ completedResponse = null }: CompletionViewProps) {
  const result = getSleepAssessmentResult(completedResponse);
  const scoreLabel = getSleepScoreLabel(completedResponse);

  return (
    <div className={styles.resultsContainer}>
      <section
        className={`${styles.heroCard} ${result ? styles[result.severityBand] : ''}`}
        aria-labelledby="sleep-assessment-result-heading"
      >
        <div className={styles.heroHeader}>
          <div className={styles.scoreRow}>
            <Badge variant="purple" size="sm" className={styles.scoreBadge}>
              {scoreLabel}
            </Badge>
          </div>
          {result && (
            <div className={styles.scoreMetric}>
              <span className={styles.metricValue}>{result.severityScore}</span>
              <span className={styles.metricLabel}>Severity score</span>
            </div>
          )}
        </div>
        <h2 id="sleep-assessment-result-heading" className={styles.heroTitle}>
          {result ? `${result.severityLabel} Sleep Support Plan` : 'Your Sleep Support Plan'}
        </h2>
        <p className={styles.heroDescription}>
          {result?.explanation ?? 'Your assessment has been completed and your sleep support plan is ready.'}
        </p>
        {result?.intentLabel && <p className={styles.intentNote}>Intent: {result.intentLabel}</p>}
      </section>

      {result?.reasoning?.length ? (
        <section className={styles.section} aria-labelledby="reasoning-heading">
          <h2 id="reasoning-heading" className={styles.sectionHeading}>
            Why this result
          </h2>
          <ul className={styles.reasonList}>
            {result.reasoning.map((reason) => (
              <li key={reason} className={styles.reasonItem}>
                {reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result?.recommendations?.length ? (
        <section className={styles.section} aria-labelledby="recommendations-heading">
          <h2 id="recommendations-heading" className={styles.sectionHeading}>
            Recommended next steps
          </h2>
          <ul className={styles.cardGrid} aria-label="Recommended next steps">
            {result.recommendations.map((card) => (
              <li key={`${card.key}-${card.priority}`} className={styles.card}>
                <div className={styles.cardTop}>
                  <Badge
                    variant={card.priority === 'primary' ? 'amber' : 'neutral'}
                    size="xs"
                    className={styles.priorityBadge}
                  >
                    {card.priority === 'primary' ? 'Priority' : 'Support'}
                  </Badge>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                </div>
                <p className={styles.cardDescription}>{card.description}</p>
                <Link
                  href={card.href}
                  className={styles.cardButton}
                  onClick={() =>
                    trackRecommendationClicked({
                      recommendation_title: card.title,
                      destination_url: card.href,
                    })
                  }
                >
                  {card.buttonText}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
