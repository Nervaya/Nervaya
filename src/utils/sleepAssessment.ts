/*
 * Domain-Based Scoring System for Sleep Assessment
 * Logic provided:
 * 1. Calculate B (Onset), R (Quality), G (Anxiety/Stress) from Q3-Q10.
 * 2. Apply adjustments from Q11.
 * 3. Priority check for Healthy edge cases.
 * 4. Categorize based on domains >= 2.
 */

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
   * Q11 options:
   * 'A' - Falling asleep faster
   * 'B' - Reducing anxiety before bed
   * 'C' - Staying asleep through the night
   * 'D' - Waking up more refreshed
   */
  q11: string[];
}

export type SleepCategory =
  | 'ONSET_ONLY'
  | 'QUALITY_ONLY'
  | 'ANXIETY_ONLY'
  | 'QUALITY_ONSET'
  | 'ONSET_ANXIETY'
  | 'QUALITY_ANXIETY'
  | 'ALL_THREE'
  | 'HEALTHY';

export interface AssessmentResult {
  scores: {
    onset: number;
    quality: number;
    anxiety: number;
  };
  category: SleepCategory;
  headline: string;
  insight: string;
  reassurance: string;
  actionFraming: string;
}

const CATEGORY_CONTENT: Record<SleepCategory, Omit<AssessmentResult, 'scores' | 'category'>> = {
  ONSET_ONLY: {
    headline: 'Falling asleep might be taking longer than it should',
    insight: 'You are probably able to sleep through the night, but getting there might take some time',
    reassurance: 'This is quite common and usually responds well to small changes',
    actionFraming: 'We’ll help you ease into sleep more naturally',
  },
  QUALITY_ONLY: {
    headline: 'Your sleep may not feel as restorative as it could be',
    insight: 'You are maybe falling asleep without much trouble, but the depth or continuity of sleep might be lacking',
    reassurance: 'Improving sleep quality often doesn’t require more time in bed, just better cycles',
    actionFraming: 'We’ll help you wake up feeling more refreshed and recovered',
  },
  ANXIETY_ONLY: {
    headline: 'Your mind might be staying a little active at night',
    insight: 'There could be some level of stress or overthinking that shows up around bedtime',
    reassurance: 'This doesn’t mean something is wrong, it just means your system hasn’t fully unwound yet',
    actionFraming: 'We’ll help you settle your mind and ease into rest',
  },
  QUALITY_ONSET: {
    headline: 'Both falling asleep and staying in deep sleep might need support',
    insight: 'It seems like it takes time to fall asleep, and the sleep itself may not feel fully restorative',
    reassurance: 'When both are addressed together, improvements tend to compound quickly',
    actionFraming: 'We’ll help you transition into sleep smoothly and improve its depth',
  },
  ONSET_ANXIETY: {
    headline: 'A busy mind might be delaying your sleep',
    insight: 'You may notice thoughts or restlessness that makes it harder to drift off',
    reassurance: 'This pattern is quite responsive to calming and grounding routines',
    actionFraming: 'We’ll help you slow things down and fall asleep with less effort',
  },
  QUALITY_ANXIETY: {
    headline: 'Stress might be affecting how deeply you sleep',
    insight: 'Even if you fall asleep, your system may not fully switch into deeper, restorative states',
    reassurance: 'As your mind relaxes, sleep quality often improves alongside it',
    actionFraming: 'We’ll help you unwind more deeply and improve recovery during sleep',
  },
  ALL_THREE: {
    headline: 'Your sleep might feel a bit off across multiple areas',
    insight: 'Falling asleep, staying asleep, and mental calmness may all be interacting here',
    reassurance: 'This can feel layered, but it also means there’s room for meaningful improvement',
    actionFraming: 'We’ll guide you through a more complete reset of your sleep patterns',
  },
  HEALTHY: {
    headline: 'Your sleep seems to be in a fairly good place',
    insight: 'There are no strong signs of disruption based on your responses',
    reassurance: 'Maintaining this is just as important as fixing issues',
    actionFraming: 'We’ll help you protect and further optimize your sleep',
  },
};

export function calculateSleepAssessment(answers: AssessmentAnswers): AssessmentResult {
  const { q3, q4, q5, q6, q7, q8, q9, q10, q11 } = answers;

  // 1. Scoring Domains & Questions
  // Evaluate the user's sleep based on three domains using questions Q3 to Q11.
  // The options for each question are sorted from least severe (Index 0 = score 0) to most severe (Index 3 or 4).
  let bScore = q3 + q9 + q10; // Sleep Onset (B)
  let rScore = q4 + q6 + q8; // Sleep Quality (R)
  let gScore = q5 + q7; // Anxiety/Stress (G)

  // Adjustment logic for Q11
  if (q11.includes('A')) bScore += 1;
  if (q11.includes('C') || q11.includes('D')) rScore += 1;
  if (q11.includes('B')) gScore += 1;

  // 2. Edge Cases (Strict Priority)
  const totalScore = bScore + rScore + gScore;

  // Edge Case 1: R + B + G = 1
  const isEC1 = totalScore === 1;
  // Edge Case 2: R + B + G = 2 (where R, B, and G are individually NOT 2)
  const isEC2 = totalScore === 2 && bScore < 2 && rScore < 2 && gScore < 2;
  // Edge Case 3: R = 1, B = 1, and G = 1
  const isEC3 = bScore === 1 && rScore === 1 && gScore === 1;

  // If any edge cases are met, status is "No major sleep issues detected" (HEALTHY)
  // Also implicitly, if all scores are < 2, it's a healthy case.
  if (isEC1 || isEC2 || isEC3 || (bScore < 2 && rScore < 2 && gScore < 2)) {
    return {
      scores: { onset: bScore, quality: rScore, anxiety: gScore },
      category: 'HEALTHY',
      ...CATEGORY_CONTENT.HEALTHY,
    };
  }

  // 3. Domain Logic & Dynamic Text
  const isOnset = bScore >= 2;
  const isQuality = rScore >= 2;
  const isAnxiety = gScore >= 2;

  let category: SleepCategory;

  if (isOnset && isQuality && isAnxiety) {
    category = 'ALL_THREE';
  } else if (isQuality && isOnset) {
    category = 'QUALITY_ONSET';
  } else if (isOnset && isAnxiety) {
    category = 'ONSET_ANXIETY';
  } else if (isQuality && isAnxiety) {
    category = 'QUALITY_ANXIETY';
  } else if (isOnset) {
    category = 'ONSET_ONLY';
  } else if (isQuality) {
    category = 'QUALITY_ONLY';
  } else if (isAnxiety) {
    category = 'ANXIETY_ONLY';
  } else {
    // Fallback (redundant due to EC check above)
    category = 'HEALTHY';
  }

  return {
    scores: { onset: bScore, quality: rScore, anxiety: gScore },
    category,
    ...CATEGORY_CONTENT[category],
  };
}
