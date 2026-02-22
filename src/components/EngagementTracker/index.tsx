'use client';

import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useExitPage } from '@/hooks/useExitPage';

export function EngagementTracker(): null {
  useScrollDepth();
  useExitPage();
  return null;
}
