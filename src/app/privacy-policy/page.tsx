'use client';

import LottieLoader from '@/components/common/LottieLoader';
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
      <LottieLoader />
    </div>
  ),
});

export default PrivacyPolicy;
