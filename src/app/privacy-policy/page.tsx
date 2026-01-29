'use client';

import dynamic from 'next/dynamic';

// Lazy-load PrivacyPolicy component to avoid loading 20+ react-icons in main bundle
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
      <p>Loading...</p>
    </div>
  ),
});

export default PrivacyPolicy;
