import type {
  IQuestionAnswer,
  IQuestionOption,
  ISleepAssessmentResponse,
  SleepAssessmentRecommendation,
  SleepAssessmentRecommendationKey,
  SleepAssessmentResult,
  SleepAssessmentSeverityBand,
} from '@/types/sleepAssessment.types';

interface SleepAssessmentResultQuestion {
  _id: string;
  order: number;
  options: IQuestionOption[];
}

interface BuildSleepAssessmentResultInput {
  questions: SleepAssessmentResultQuestion[];
  answers: IQuestionAnswer[];
}

const PROFILE_QUESTION_ORDERS = [1, 2] as const;
const SEVERITY_QUESTION_ORDERS = [3, 4, 5, 6, 7, 8] as const;
const INTENT_QUESTION_ORDER = 9;

const SEVERITY_LABELS: Record<SleepAssessmentSeverityBand, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
};

const RECOMMENDATION_LIBRARY: Record<
  SleepAssessmentRecommendationKey,
  Omit<SleepAssessmentRecommendation, 'key' | 'priority'>
> = {
  guided_audio: {
    title: 'Guided Audio',
    description: 'Use calming sleep audio to settle into bed and support a more consistent night routine.',
    buttonText: 'Explore Guided Audio',
    href: '/deep-rest',
  },
  guided_meditation_audio: {
    title: 'Guided Meditation Audio',
    description: 'Your answers suggest overthinking at bedtime, so meditation-led audio should come first.',
    buttonText: 'Start Guided Audio',
    href: '/deep-rest',
  },
  counselling: {
    title: 'Counselling',
    description: 'Work with a therapist to address the thoughts and patterns that are disrupting your sleep.',
    buttonText: 'Book Counselling',
    href: '/therapy-corner',
  },
  supplement: {
    title: 'Sleep Supplement',
    description: 'Add sleep support when falling asleep is difficult or when your nights need extra support.',
    buttonText: 'View Supplements',
    href: '/supplements',
  },
};

function createRecommendation(
  key: SleepAssessmentRecommendationKey,
  priority: SleepAssessmentRecommendation['priority'],
): SleepAssessmentRecommendation {
  return {
    key,
    priority,
    ...RECOMMENDATION_LIBRARY[key],
  };
}

function parseExplicitNumericScore(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  const match = trimmed.match(/^(-?\d+)\b/);
  return match ? Number(match[1]) : null;
}

function normalizeQuestionId(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toString' in value) {
    return String(value);
  }
  return '';
}

function getMatchedOption(question: SleepAssessmentResultQuestion, answer: string): IQuestionOption | null {
  return question.options.find((option) => option.value === answer || option.label === answer) ?? null;
}

function getOptionIndex(question: SleepAssessmentResultQuestion, option: IQuestionOption): number {
  return question.options.findIndex((item) => item.value === option.value && item.label === option.label);
}

function getAnswerScore(
  question: SleepAssessmentResultQuestion | undefined,
  answer: string | string[] | undefined,
): number {
  if (question == null || answer == null || Array.isArray(answer)) {
    return 0;
  }

  const directScore = parseExplicitNumericScore(answer);
  if (directScore != null) {
    return directScore;
  }

  const matchedOption = getMatchedOption(question, answer);
  if (!matchedOption) {
    return 0;
  }

  const optionValueScore = parseExplicitNumericScore(matchedOption.value);
  if (optionValueScore != null) {
    return optionValueScore;
  }

  const optionLabelScore = parseExplicitNumericScore(matchedOption.label);
  if (optionLabelScore != null) {
    return optionLabelScore;
  }

  return Math.max(0, getOptionIndex(question, matchedOption));
}

function getAnswerLabel(
  question: SleepAssessmentResultQuestion | undefined,
  answer: string | string[] | undefined,
): string | null {
  if (!question || answer == null) return null;
  if (Array.isArray(answer)) {
    if (answer.length === 0) return null;
    return answer
      .map((value) => getMatchedOption(question, value)?.label ?? value)
      .filter(Boolean)
      .join(', ');
  }

  return getMatchedOption(question, answer)?.label ?? answer;
}

function getSeverityBand(score: number): SleepAssessmentSeverityBand {
  if (score <= 4) return 'mild';
  if (score <= 10) return 'moderate';
  return 'severe';
}

function buildReasoning(params: {
  severityBand: SleepAssessmentSeverityBand;
  severityScore: number;
  q3Score: number;
  q5Score: number;
  q7Score: number;
  intentLabel: string | null;
}): string[] {
  const { severityBand, severityScore, q3Score, q5Score, q7Score, intentLabel } = params;
  const reasoning: string[] = [];

  if (severityBand === 'mild') {
    reasoning.push(`Your total severity score is ${severityScore}, which falls in the mild range (0-4).`);
    reasoning.push('Guided audio is the primary recommendation, with counselling as supporting care.');
    if (q3Score === 3) {
      reasoning.push('Q3 shows a frequent sleep onset issue, so a sleep supplement is strongly recommended.');
    }
  }

  if (severityBand === 'moderate') {
    reasoning.push(`Your total severity score is ${severityScore}, which falls in the moderate range (5-10).`);
    reasoning.push('Supplement support is recommended across the moderate band.');
    if (q5Score === 0 && q7Score === 0) {
      reasoning.push('Because Q5 and Q7 are both 0, counselling is not recommended right now.');
    } else {
      reasoning.push('Because Q5 or Q7 is above 0, counselling is added to the plan.');
    }
    if (q5Score === 3) {
      reasoning.push('Q5 indicates high overthinking, so guided meditation audio is prioritised.');
    }
  }

  if (severityBand === 'severe') {
    reasoning.push(`Your total severity score is ${severityScore}, which falls in the severe range (11-17+).`);
    reasoning.push('The severe band calls for the full plan: counselling, guided audio, and supplement support.');
    reasoning.push('This is the strongest recommendation path from the assessment.');
  }

  if (intentLabel) {
    reasoning.push(`Your stated intent was "${intentLabel}".`);
  }

  return reasoning;
}

function buildExplanation(params: {
  severityBand: SleepAssessmentSeverityBand;
  q3Score: number;
  q5Score: number;
  q7Score: number;
}): string {
  const { severityBand, q3Score, q5Score, q7Score } = params;

  if (severityBand === 'mild') {
    return q3Score === 3
      ? 'You are in the mild range, but your answers show a frequent sleep-onset issue. Start with guided audio, keep counselling available, and add sleep support to help you fall asleep more reliably.'
      : 'You are in the mild range. Start with guided audio and keep counselling available for extra support while you build a calmer bedtime routine.';
  }

  if (severityBand === 'moderate') {
    if (q5Score === 3) {
      return 'You are in the moderate range, with overthinking standing out as a key driver. Start with supplement support, add counselling as needed, and prioritise guided meditation audio.';
    }
    if (q5Score === 0 && q7Score === 0) {
      return 'You are in the moderate range, but your answers do not currently point to counselling as a priority. Start with supplement support and monitor how your sleep responds.';
    }
    return 'You are in the moderate range. Supplement support is recommended, and counselling is added because your answers show more than a purely mild pattern.';
  }

  return 'You are in the severe range. The strongest plan is recommended here: counselling, guided audio, and supplement support together.';
}

function buildRecommendations(params: {
  severityBand: SleepAssessmentSeverityBand;
  q3Score: number;
  q5Score: number;
  q7Score: number;
}): SleepAssessmentRecommendation[] {
  const { severityBand, q3Score, q5Score, q7Score } = params;
  const recommendations: SleepAssessmentRecommendation[] = [];

  if (severityBand === 'mild') {
    recommendations.push(createRecommendation('guided_audio', 'primary'));
    recommendations.push(createRecommendation('counselling', 'secondary'));
    if (q3Score === 3) {
      recommendations.push(createRecommendation('supplement', 'primary'));
    }
  }

  if (severityBand === 'moderate') {
    if (q5Score === 3) {
      recommendations.push(createRecommendation('guided_meditation_audio', 'primary'));
      recommendations.push(createRecommendation('supplement', 'secondary'));
    } else {
      recommendations.push(createRecommendation('supplement', 'primary'));
    }
    if (!(q5Score === 0 && q7Score === 0)) {
      recommendations.push(createRecommendation('counselling', 'secondary'));
    }
  }

  if (severityBand === 'severe') {
    recommendations.push(createRecommendation('counselling', 'primary'));
    recommendations.push(createRecommendation('guided_audio', 'primary'));
    recommendations.push(createRecommendation('supplement', 'primary'));
  }

  return recommendations;
}

export function buildSleepAssessmentResult({
  questions,
  answers,
}: BuildSleepAssessmentResultInput): SleepAssessmentResult {
  const questionById = new Map(questions.map((question) => [normalizeQuestionId(question._id), question]));
  const questionByOrder = new Map(questions.map((question) => [question.order, question]));
  const answerByOrder = new Map<number, string | string[]>();

  for (const answer of answers) {
    const question = questionById.get(normalizeQuestionId(answer.questionId));
    if (question) {
      answerByOrder.set(question.order, answer.answer);
    }
  }

  const severityScore = SEVERITY_QUESTION_ORDERS.reduce((total, order) => {
    const question = questionByOrder.get(order);
    const answer = answerByOrder.get(order);
    return total + getAnswerScore(question, answer);
  }, 0);

  const severityBand = getSeverityBand(severityScore);
  const q3Score = getAnswerScore(questionByOrder.get(3), answerByOrder.get(3));
  const q5Score = getAnswerScore(questionByOrder.get(5), answerByOrder.get(5));
  const q7Score = getAnswerScore(questionByOrder.get(7), answerByOrder.get(7));
  const intentQuestion = questionByOrder.get(INTENT_QUESTION_ORDER);
  const intentAnswer = answerByOrder.get(INTENT_QUESTION_ORDER) ?? null;
  const intentLabel = getAnswerLabel(intentQuestion, intentAnswer ?? undefined);

  return {
    severityScore,
    severityBand,
    severityLabel: SEVERITY_LABELS[severityBand],
    explanation: buildExplanation({ severityBand, q3Score, q5Score, q7Score }),
    reasoning: buildReasoning({ severityBand, severityScore, q3Score, q5Score, q7Score, intentLabel }),
    recommendations: buildRecommendations({ severityBand, q3Score, q5Score, q7Score }),
    intentAnswer,
    intentLabel,
    flags: {
      recommendsSupplement: severityBand !== 'mild' || q3Score === 3,
      recommendsCounselling: severityBand === 'severe' || severityBand === 'mild' || !(q5Score === 0 && q7Score === 0),
      prioritiseGuidedMeditationAudio: severityBand === 'moderate' && q5Score === 3,
      hasFrequentSleepOnsetIssue: q3Score === 3,
      highOverthinking: q5Score === 3,
    },
  };
}

export function getSleepAssessmentResult(response: ISleepAssessmentResponse | null): SleepAssessmentResult | null {
  return response?.result ?? null;
}

export function getSleepScoreLabel(response: ISleepAssessmentResponse | null): string {
  return getSleepAssessmentResult(response)?.severityLabel ?? 'Moderate';
}

export function getSleepRecommendationType(
  response: ISleepAssessmentResponse | null,
): 'content' | 'therapy' | 'product' {
  const result = getSleepAssessmentResult(response);
  if (!result) return 'content';
  if (result.flags.recommendsCounselling) return 'therapy';
  if (result.flags.recommendsSupplement) return 'product';
  return 'content';
}

export const SLEEP_ASSESSMENT_QUESTION_GROUPS = {
  profile: PROFILE_QUESTION_ORDERS,
  severity: SEVERITY_QUESTION_ORDERS,
  intent: INTENT_QUESTION_ORDER,
} as const;
