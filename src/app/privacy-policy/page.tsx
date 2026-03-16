'use client';

import { LottieLoader } from '@/components/common';
import dynamic from 'next/dynamic';

const PrivacyPolicy = dynamic(() => import('./PrivacyPolicyContent'), {
  ssr: true,
  loading: () => (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LottieLoader centerPage />
    </div>
  ),
});

export default PrivacyPolicy;
