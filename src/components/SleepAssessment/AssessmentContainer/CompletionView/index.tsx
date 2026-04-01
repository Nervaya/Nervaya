'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ISleepAssessmentResponse, ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import { calculateSleepAssessment, type SleepSegment, type ServiceRecommendation } from '@/utils/sleepAssessment';
import { cartApi } from '@/lib/api/cart';
import { ITEM_TYPE } from '@/lib/constants/enums';
import { DRIFT_OFF_SESSION_PRICE, DRIFT_OFF_SESSION_IMAGE } from '@/lib/constants/driftOff.constants';
import { useCart } from '@/context/CartContext';
import { StatusBanner } from './StatusBanner';
import { InsightBlock } from './InsightBlock';
import { ServiceCard } from './ServiceCard';
import { HealthyExplore } from './HealthyExplore';
import styles from './styles.module.css';

interface CompletionViewProps {
  completedResponse?: ISleepAssessmentResponse | null;
  questions?: ISleepAssessmentQuestion[];
}

const SEGMENT_DISPLAY: Record<SleepSegment, { label: string; dotColor: string; reason: string }> = {
  QUALITY_ONLY: { label: 'QUALITY ONLY', dotColor: '#ef4444', reason: 'Sleep Quality' },
  ONSET_ONLY: { label: 'ONSET ONLY', dotColor: '#3b82f6', reason: 'Sleep Onset' },
  ANXIETY_ONLY: { label: 'ANXIETY ONLY', dotColor: '#22c55e', reason: 'Anxiety / Stress' },
  QUALITY_ONSET: { label: 'QUALITY + ONSET', dotColor: '#6366f1', reason: 'Quality & Onset' },
  ONSET_ANXIETY: { label: 'ONSET + ANXIETY', dotColor: '#22c55e', reason: 'Onset & Anxiety' },
  QUALITY_ANXIETY: { label: 'QUALITY + ANXIETY', dotColor: '#f59e0b', reason: 'Quality & Anxiety' },
  ALL_THREE: { label: 'ALL THREE DOMAINS', dotColor: '#8b5cf6', reason: 'Overall Sleep Health' },
  NO_DOMAIN: { label: 'HEALTHY', dotColor: '#10b981', reason: '' },
};

function useAssessmentResult(
  completedResponse: ISleepAssessmentResponse | null,
  questions: ISleepAssessmentQuestion[],
) {
  return useMemo(() => {
    if (!completedResponse?.answers || questions.length === 0) return null;

    const answersMap = new Map<number, string | string[]>();
    const questionsByOrder = new Map<number, ISleepAssessmentQuestion>();

    questions.forEach((q) => questionsByOrder.set(q.order, q));
    completedResponse.answers.forEach((a) => {
      const q = questions.find((quest) => quest._id === a.questionId || quest.questionId === a.questionId);
      if (q) answersMap.set(q.order, a.answer);
    });

    const getIdx = (order: number): number => {
      const q = questionsByOrder.get(order);
      const a = answersMap.get(order);
      if (!q || a === undefined || Array.isArray(a)) return 0;
      const idx = q.options.findIndex((opt) => opt.value === a || opt.label === a);
      return idx >= 0 ? idx : 0;
    };

    const getQ11 = (): string[] => {
      const q = questionsByOrder.get(11);
      const a = answersMap.get(11);
      if (!q || !a) return [];
      const values = Array.isArray(a) ? a : [a];
      return values
        .map((val) => {
          const idx = q.options.findIndex((opt) => opt.value === val || opt.label === val);
          return idx >= 0 ? String.fromCharCode(65 + idx) : '';
        })
        .filter((letter) => ['A', 'B', 'C', 'D'].includes(letter));
    };

    return calculateSleepAssessment({
      q3: getIdx(3),
      q4: getIdx(4),
      q5: getIdx(5),
      q6: getIdx(6),
      q7: getIdx(7),
      q8: getIdx(8),
      q9: getIdx(9),
      q10: getIdx(10),
      q11: getQ11(),
    });
  }, [completedResponse, questions]);
}

export function CompletionView({ completedResponse = null, questions = [] }: CompletionViewProps) {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const resultData = useAssessmentResult(completedResponse, questions);

  const handleAddToCart = useCallback(
    async (svc: ServiceRecommendation) => {
      setAddingToCart(svc.name);
      try {
        if (svc.name === 'Guided Audio') {
          await cartApi.add(
            'drift-off-session',
            1,
            ITEM_TYPE.DRIFT_OFF,
            'Deep Rest Session',
            DRIFT_OFF_SESSION_PRICE,
            DRIFT_OFF_SESSION_IMAGE,
          );
          await refreshCart();
          router.push('/checkout');
        } else if (svc.name === 'Supplement') {
          router.push('/supplements');
        } else if (svc.name === 'Therapy') {
          router.push('/therapy-corner');
        }
      } catch {
        // User will see the navigated page
      } finally {
        setAddingToCart(null);
      }
    },
    [refreshCart, router],
  );

  if (!resultData) {
    return (
      <div className={styles.loading}>
        <p>Analyzing your sleep patterns...</p>
      </div>
    );
  }

  const seg = SEGMENT_DISPLAY[resultData.segment];
  const isHealthy = resultData.segment === 'NO_DOMAIN';

  return (
    <div className={styles.page}>
      <StatusBanner status={resultData.status} severityLevel={resultData.severityLevel} />

      <InsightBlock
        segmentLabel={seg.label}
        dotColor={seg.dotColor}
        headline={resultData.headline}
        insight={resultData.insight}
        reassurance={resultData.reassurance}
        actionFraming={resultData.actionFraming}
      />

      {isHealthy ? (
        <HealthyExplore services={resultData.services} />
      ) : (
        <section className={styles.cardsWrap}>
          <h2 className={styles.cardsHeading}>Recommended for You</h2>
          <ul className={styles.cardGrid} aria-label="Service recommendations">
            {resultData.services.map((svc) => (
              <ServiceCard
                key={svc.name}
                service={svc}
                reason={seg.reason}
                dotColor={seg.dotColor}
                isAdding={addingToCart === svc.name}
                onAddToCart={() => handleAddToCart(svc)}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
