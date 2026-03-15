'use client';

import { useEffect } from 'react';
import { trackViewAudioPage } from '@/utils/analytics';

export function DriftOffPageTracker(): null {
  useEffect(() => {
    trackViewAudioPage();
  }, []);
  return null;
}
