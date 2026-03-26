'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import type { ISleepAssessmentResponse, ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import { getSleepScoreLabel } from '@/lib/utils/sleepScore.util';
import { calculateSleepAssessment, type AssessmentAnswers } from '@/utils/sleepAssessment';
import styles from './styles.module.css';

interface CompletionViewProps {
  completedResponse?: ISleepAssessmentResponse | null;
  questions?: ISleepAssessmentQuestion[];
}

export function CompletionView({ completedResponse = null, questions = [] }: CompletionViewProps) {
  // Use useMemo to avoid recalculating on every render
  const resultData = useMemo(() => {
    if (!completedResponse?.answers || questions.length === 0) return null;

    const answersMap = new Map<number, string | string[]>();
    const questionsByOrder = new Map<number, ISleepAssessmentQuestion>();

    questions.forEach((q) => questionsByOrder.set(q.order, q));
    completedResponse.answers.forEach((a) => {
      const q = questions.find((quest) => quest._id === a.questionId || quest.questionId === a.questionId);
      if (q) answersMap.set(q.order, a.answer);
    });

    const getIdx = (order: number) => {
      const q = questionsByOrder.get(order);
      const a = answersMap.get(order);
      if (!q || a === undefined || Array.isArray(a)) return 0;
      const idx = q.options.findIndex((opt) => opt.value === a || opt.label === a);
      return idx >= 0 ? idx : 0;
    };

    const getQ11 = () => {
      const q = questionsByOrder.get(11);
      const a = answersMap.get(11);
      if (!q || !a || !Array.isArray(a)) return [];
      return a
        .map((val) => {
          const idx = q.options.findIndex((opt) => opt.value === val || opt.label === val);
          return String.fromCharCode(65 + idx); // 0 -> A, 1 -> B, etc.
        })
        .filter((val) => ['A', 'B', 'C', 'D'].includes(val));
    };

    const assessmentAnswers: AssessmentAnswers = {
      q3: getIdx(3),
      q4: getIdx(4),
      q5: getIdx(5),
      q6: getIdx(6),
      q7: getIdx(7),
      q8: getIdx(8),
      q9: getIdx(9),
      q10: getIdx(10),
      q11: getQ11(),
    };

    return calculateSleepAssessment(assessmentAnswers);
  }, [completedResponse, questions]);

  const scoreLabel = getSleepScoreLabel(completedResponse);

  const domains = [
    {
      label: 'Sleep Onset',
      score: resultData?.scores.onset ?? 0,
      color: '#3b82f6', // Blue
      icon: 'solar:moon-sleep-bold',
      active: (resultData?.scores.onset ?? 0) >= 2,
    },
    {
      label: 'Sleep Quality',
      score: resultData?.scores.quality ?? 0,
      color: '#ef4444', // Red
      icon: 'solar:star-fall-minimalistic-bold',
      active: (resultData?.scores.quality ?? 0) >= 2,
    },
    {
      label: 'Mental Calm',
      score: resultData?.scores.anxiety ?? 0,
      color: '#10b981', // Green
      icon: 'solar:wind-bold',
      active: (resultData?.scores.anxiety ?? 0) >= 2,
    },
  ];

  if (!resultData) {
    return (
      <div className={styles.loadingContainer}>
        <p>Analyzing your sleep patterns...</p>
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer}>
      <header className={styles.resultHeader}>
        <div className={styles.categoryBadge}>{scoreLabel}</div>
        <h1 className={styles.headline}>{resultData.headline}</h1>
        <p className={styles.insight}>{resultData.insight}</p>
      </header>

      <section className={styles.domainSection}>
        <h2 className={styles.sectionTitle}>Sleep Analysis Domains</h2>
        <div className={styles.domainGrid}>
          {domains.map((domain) => (
            <div
              key={domain.label}
              className={`${styles.domainCard} ${domain.active ? styles.activeDomain : ''}`}
              style={{ '--domain-color': domain.color } as React.CSSProperties}
            >
              <div className={styles.domainIcon}>
                <Icon icon={domain.icon} />
              </div>
              <div className={styles.domainInfo}>
                <h3 className={styles.domainLabel}>{domain.label}</h3>
                <div className={styles.scoreWrapper}>
                  <div className={styles.scoreBar}>
                    <div
                      className={styles.scoreFill}
                      style={{ width: `${Math.min((domain.score / 6) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className={styles.scoreText}>Score: {domain.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.guidanceGrid}>
        <section className={styles.guidanceCard}>
          <div className={`${styles.iconCircle} ${styles.reassuranceIcon}`}>
            <Icon icon="solar:heart-bold" />
          </div>
          <h3 className={styles.guidanceTitle}>Our Perspective</h3>
          <p className={styles.guidanceText}>{resultData.reassurance}</p>
        </section>

        <section className={styles.guidanceCard}>
          <div className={`${styles.iconCircle} ${styles.actionIcon}`}>
            <Icon icon="solar:globus-bold" />
          </div>
          <h3 className={styles.guidanceTitle}>The Path Forward</h3>
          <p className={styles.guidanceText}>{resultData.actionFraming}</p>
        </section>
      </div>

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to improve your sleep?</h2>
        <div className={styles.ctaButtons}>
          <Link href="/deep-rest" className={styles.primaryCta}>
            Explore Deep Rest
          </Link>
          <Link href="/therapy-corner" className={styles.secondaryCta}>
            Supportive Counselling
          </Link>
        </div>
      </section>
    </div>
  );
}
