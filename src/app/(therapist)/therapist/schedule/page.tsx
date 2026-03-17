'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import ConsultingHoursManager from '@/components/Admin/ConsultingHoursManager';
import { LottieLoader, type BreadcrumbItem } from '@/components/common';
import { useTherapist } from '@/context/TherapistContext';
import containerStyles from '@/app/(customer)/dashboard/styles.module.css';
import styles from './styles.module.css';

export default function TherapistSchedulePage() {
  const router = useRouter();
  const { profile, loading, error } = useTherapist();
  const therapistId = profile?._id?.toString() || null;

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
