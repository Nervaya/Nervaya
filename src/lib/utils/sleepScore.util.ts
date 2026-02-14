import type { ISleepAssessmentResponse } from '@/types/sleepAssessment.types';

export const SLEEP_SCORE_LABELS = ['Poor', 'Fair', 'Moderate', 'Good', 'Excellent'] as const;

export function getSleepScoreLabel(response: ISleepAssessmentResponse | null): (typeof SLEEP_SCORE_LABELS)[number] {
  if (!response?.answers?.length) return 'Moderate';
  const count = response.answers.length;
  const index = Math.min(Math.floor(count / 2), SLEEP_SCORE_LABELS.length - 1);
  return SLEEP_SCORE_LABELS[Math.max(0, index)];
}

export const NERVAYA_PICKS = [
  {
    title: 'Therapy Corner',
    description:
      'Let stress and anxiety soften. Sleep deeply and wake up lighter with care from experienced therapists.',
    buttonText: 'Shop Now',
    href: '/therapy-corner',
  },
  {
    title: 'Sleep Elixir',
    description: 'Fully herbal. Safe for daily use. Promotes deep sleep naturally without dependence.',
    buttonText: 'Shop Now',
    href: '/supplements',
  },
] as const;

export const MORE_FAVOURITES = [
  {
    title: 'Drift Off',
    description: 'Custom sleep sessions that calm your mind, ease your night, and set you up for a productive day.',
    buttonText: 'Explore Session',
    href: '/drift-off',
  },
] as const;
