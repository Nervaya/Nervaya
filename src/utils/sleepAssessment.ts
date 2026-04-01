/*
 * Domain-Based Scoring System for Sleep Assessment
 * Based on the product specification:
 * 1. Calculate B (Onset), R (Quality), G (Anxiety/Stress) from Q3-Q10.
 * 2. Apply single-select adjustment from Q11.
 * 3. Classify into segment based on domain thresholds.
 * 4. Map segment to status label, dynamic text, and service recommendations.
 */

// ─── Question Config (single source of truth for option counts) ───
export const QUESTION_CONFIG = {
  Q3: { options: 4 }, // max value = 3
  Q4: { options: 4 }, // max value = 3
  Q5: { options: 4 }, // max value = 3
  Q6: { options: 3 }, // max value = 2
  Q7: { options: 5 }, // max value = 4
  Q8: { options: 3 }, // max value = 2
  Q9: { options: 4 }, // max value = 3
  Q10: { options: 5 }, // max value = 4
} as const;

// ─── Classification threshold ───
const DOMAIN_THRESHOLD = 2;

// ─── Types ───
export interface AssessmentAnswers {
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
  q10: number;
  /**
   * Q11 options (can be single or multi-select):
   * 'A' - Falling asleep faster       → B + 1
   * 'B' - Reducing anxiety before bed  → G + 1
   * 'C' - Staying asleep through night → R + 1
   * 'D' - Waking up more refreshed     → R + 1
   * Each selected option adds +1 to its domain.
   */
  q11: string[];
}

export type SleepSegment =
  | 'ALL_THREE'
  | 'QUALITY_ONSET'
  | 'ONSET_ANXIETY'
  | 'QUALITY_ANXIETY'
  | 'QUALITY_ONLY'
  | 'ONSET_ONLY'
  | 'ANXIETY_ONLY'
  | 'NO_DOMAIN';

export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'none';

export type ServicePriority = 'High' | 'Low' | 'None';

export interface ServiceRecommendation {
  name: 'Supplement' | 'Therapy' | 'Guided Audio';
  priority: ServicePriority;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  href: string;
  icon: string;
}

export interface AssessmentResult {
  scores: {
    B: number;
    R: number;
    G: number;
  };
  segment: SleepSegment;
  status: string;
  severityLevel: SeverityLevel;
  headline: string;
  insight: string;
  reassurance: string;
  actionFraming: string;
  services: ServiceRecommendation[];
}

// ─── Status Labels ───
const STATUS_LABELS: Record<SleepSegment, string> = {
  ONSET_ONLY: 'Mild Sleep Issues Detected',
  QUALITY_ONLY: 'Mild Sleep Issues Detected',
  ANXIETY_ONLY: 'Mild Sleep Issues Detected',
  QUALITY_ONSET: 'Moderate Sleep Issues Detected',
  ONSET_ANXIETY: 'Moderate Sleep Issues Detected',
  QUALITY_ANXIETY: 'Moderate Sleep Issues Detected',
  ALL_THREE: 'Severe Sleep Issues Detected',
  NO_DOMAIN: 'No Major Sleep Issues Detected',
};

const SEVERITY_LEVELS: Record<SleepSegment, SeverityLevel> = {
  ONSET_ONLY: 'mild',
  QUALITY_ONLY: 'mild',
  ANXIETY_ONLY: 'mild',
  QUALITY_ONSET: 'moderate',
  ONSET_ANXIETY: 'moderate',
  QUALITY_ANXIETY: 'moderate',
  ALL_THREE: 'severe',
  NO_DOMAIN: 'none',
};

// ─── Dynamic Text per Segment ───
const SEGMENT_CONTENT: Record<
  SleepSegment,
  {
    headline: string;
    insight: string;
    reassurance: string;
    actionFraming: string;
  }
> = {
  ONSET_ONLY: {
    headline: 'Falling asleep might be taking longer than it should',
    insight: 'You are probably able to sleep through the night, but getting there might take some time',
    reassurance: 'This is quite common and usually responds well to small changes',
    actionFraming: "We'll help you ease into sleep more naturally",
  },
  QUALITY_ONLY: {
    headline: 'Your sleep may not feel as restorative as it could be',
    insight: 'You are maybe falling asleep without much trouble, but the depth or continuity of sleep might be lacking',
    reassurance: "Improving sleep quality often doesn't require more time in bed, just better cycles",
    actionFraming: "We'll help you wake up feeling more refreshed and recovered",
  },
  ANXIETY_ONLY: {
    headline: 'Your mind might be staying a little active at night',
    insight: 'There could be some level of stress or overthinking that shows up around bedtime',
    reassurance: "This doesn't mean something is wrong, it just means your system hasn't fully unwound yet",
    actionFraming: "We'll help you settle your mind and ease into rest",
  },
  QUALITY_ONSET: {
    headline: 'Both falling asleep and staying in deep sleep might need support',
    insight: 'It seems like it takes time to fall asleep, and the sleep itself may not feel fully restorative',
    reassurance: 'When both are addressed together, improvements tend to compound quickly',
    actionFraming: "We'll help you transition into sleep smoothly and improve its depth",
  },
  ONSET_ANXIETY: {
    headline: 'A busy mind might be delaying your sleep',
    insight: 'You may notice thoughts or restlessness that makes it harder to drift off',
    reassurance: 'This pattern is quite responsive to calming and grounding routines',
    actionFraming: "We'll help you slow things down and fall asleep with less effort",
  },
  QUALITY_ANXIETY: {
    headline: 'Stress might be affecting how deeply you sleep',
    insight: 'Even if you fall asleep, your system may not fully switch into deeper, restorative states',
    reassurance: 'As your mind relaxes, sleep quality often improves alongside it',
    actionFraming: "We'll help you unwind more deeply and improve recovery during sleep",
  },
  ALL_THREE: {
    headline: 'Your sleep might feel a bit off across multiple areas',
    insight: 'Falling asleep, staying asleep, and mental calmness may all be interacting here',
    reassurance: "This can feel layered, but it also means there's room for meaningful improvement",
    actionFraming: "We'll guide you through a more complete reset of your sleep patterns",
  },
  NO_DOMAIN: {
    headline: 'Your sleep seems to be in a fairly good place',
    insight: 'There are no strong signs of disruption based on your responses',
    reassurance: 'Maintaining this is just as important as fixing issues',
    actionFraming: "We'll help you protect and further optimize your sleep",
  },
};

// ─── Service Definitions ───
const SERVICE_DEFS: Record<'Supplement' | 'Therapy' | 'Guided Audio', Omit<ServiceRecommendation, 'priority'>> = {
  Supplement: {
    name: 'Supplement',
    title: 'Sleep Elixir',
    description: 'Fast-absorbing formula for deep, restorative sleep.',
    primaryCta: 'Buy Now',
    secondaryCta: 'Add to Cart',
    href: '/supplements',
    icon: 'solar:pill-bold',
  },
  Therapy: {
    name: 'Therapy',
    title: 'Therapy Corner',
    description: 'One-on-one support to address the root of your sleep patterns.',
    primaryCta: 'Book Session',
    secondaryCta: 'Add to Cart',
    href: '/therapy-corner',
    icon: 'solar:user-speak-bold',
  },
  'Guided Audio': {
    name: 'Guided Audio',
    title: 'Deep Rest',
    description: 'Guided audio sessions tailored to help you unwind and fall asleep.',
    primaryCta: 'Start Listening',
    secondaryCta: 'Add to Cart',
    href: '/deep-rest',
    icon: 'solar:headphones-round-bold',
  },
};

function makeService(
  name: 'Supplement' | 'Therapy' | 'Guided Audio',
  priority: ServicePriority,
): ServiceRecommendation {
  return { ...SERVICE_DEFS[name], priority };
}

// ─── Service Recommendation per Segment (order matters: left to right) ───
const SEGMENT_SERVICES: Record<SleepSegment, ServiceRecommendation[]> = {
  QUALITY_ONLY: [makeService('Supplement', 'High'), makeService('Therapy', 'High'), makeService('Guided Audio', 'Low')],
  ONSET_ONLY: [makeService('Supplement', 'High'), makeService('Guided Audio', 'High'), makeService('Therapy', 'Low')],
  ANXIETY_ONLY: [makeService('Therapy', 'High'), makeService('Guided Audio', 'High'), makeService('Supplement', 'Low')],
  QUALITY_ONSET: [
    makeService('Supplement', 'High'),
    makeService('Guided Audio', 'High'),
    makeService('Therapy', 'Low'),
  ],
  ONSET_ANXIETY: [
    makeService('Therapy', 'High'),
    makeService('Supplement', 'High'),
    makeService('Guided Audio', 'Low'),
  ],
  QUALITY_ANXIETY: [
    makeService('Supplement', 'High'),
    makeService('Therapy', 'High'),
    makeService('Guided Audio', 'Low'),
  ],
  ALL_THREE: [makeService('Supplement', 'High'), makeService('Therapy', 'High'), makeService('Guided Audio', 'High')],
  NO_DOMAIN: [makeService('Supplement', 'None'), makeService('Therapy', 'None'), makeService('Guided Audio', 'None')],
};

// ─── Main Calculation ───
export function calculateSleepAssessment(answers: AssessmentAnswers): AssessmentResult {
  const { q3, q4, q5, q6, q7, q8, q9, q10, q11 } = answers;

  // Step 1 — Base domain scores
  let B = q3 + q9 + q10; // Sleep Onset
  let R = q4 + q6 + q8; // Sleep Quality
  let G = q5 + q7; // Anxiety/Stress

  // Step 2 — Q11 adjustment (each selected option adds +1 to its domain)
  if (q11.includes('A')) B += 1;
  if (q11.includes('B')) G += 1;
  if (q11.includes('C')) R += 1;
  if (q11.includes('D')) R += 1;

  // Step 3 — Segment classification (sequential if-else, first match wins)
  let segment: SleepSegment;

  if (R >= DOMAIN_THRESHOLD && B >= DOMAIN_THRESHOLD && G >= DOMAIN_THRESHOLD) {
    segment = 'ALL_THREE';
  } else if (R >= DOMAIN_THRESHOLD && B >= DOMAIN_THRESHOLD) {
    segment = 'QUALITY_ONSET';
  } else if (B >= DOMAIN_THRESHOLD && G >= DOMAIN_THRESHOLD) {
    segment = 'ONSET_ANXIETY';
  } else if (R >= DOMAIN_THRESHOLD && G >= DOMAIN_THRESHOLD) {
    segment = 'QUALITY_ANXIETY';
  } else if (R >= DOMAIN_THRESHOLD) {
    segment = 'QUALITY_ONLY';
  } else if (B >= DOMAIN_THRESHOLD) {
    segment = 'ONSET_ONLY';
  } else if (G >= DOMAIN_THRESHOLD) {
    segment = 'ANXIETY_ONLY';
  } else {
    segment = 'NO_DOMAIN';
  }

  return {
    scores: { B, R, G },
    segment,
    status: STATUS_LABELS[segment],
    severityLevel: SEVERITY_LEVELS[segment],
    ...SEGMENT_CONTENT[segment],
    services: SEGMENT_SERVICES[segment],
  };
}
