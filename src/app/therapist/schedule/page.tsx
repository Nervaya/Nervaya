'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import ConsultingHoursManager from '@/components/Admin/ConsultingHoursManager';
import LottieLoader from '@/components/common/LottieLoader';
import { therapistApi } from '@/lib/api/therapistApi';
import containerStyles from '@/app/dashboard/styles.module.css';
import styles from './styles.module.css';
import type { BreadcrumbItem } from '@/components/common/Breadcrumbs';

export default function TherapistSchedulePage() {
  const router = useRouter();
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await therapistApi.getMe();
        if (cancelled) return;
        if (res?.success && res?.data?._id) {
          setTherapistId(res.data._id.toString());
        } else {
          setError(res?.message || 'Could not load your profile. Contact admin to link your account.');
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Therapist', href: '/therapist/dashboard' },
    { label: 'Dashboard', href: '/therapist/dashboard' },
    { label: 'Set your dates' },
  ];

  if (loading) {
    return (
      <Sidebar hideGlobalBreadcrumbs>
        <div className={containerStyles.container}>
          <PageHeader title="Set your dates" subtitle="Manage your availability" breadcrumbs={breadcrumbs} />
          <div className={containerStyles.loadingContainer} aria-busy="true">
            <LottieLoader width={200} height={200} />
          </div>
        </div>
      </Sidebar>
    );
  }

  if (error || !therapistId) {
    return (
      <Sidebar hideGlobalBreadcrumbs>
        <div className={containerStyles.container}>
          <PageHeader title="Set your dates" subtitle="Manage your availability" breadcrumbs={breadcrumbs} />
          <div className={styles.error}>
            <p>{error || 'Therapist profile not found.'}</p>
            <button type="button" onClick={() => router.push('/therapist/dashboard')} className={styles.backBtn}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar hideGlobalBreadcrumbs>
      <div className={containerStyles.container}>
        <PageHeader
          title="Set your dates"
          subtitle="Configure when you are available for sessions. Save hours then generate slots."
          breadcrumbs={breadcrumbs}
        />
        <ConsultingHoursManager therapistId={therapistId} onUpdate={() => {}} />
      </div>
    </Sidebar>
  );
}
