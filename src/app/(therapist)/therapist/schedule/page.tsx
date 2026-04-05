'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import { useLoading } from '@/context/LoadingContext';
import { WeekCalendar } from '@/components/WeekCalendar';
import { useTherapist } from '@/context/TherapistContext';
import { Icon } from '@iconify/react';
import styles from './styles.module.css';

export default function TherapistSchedulePage() {
  const router = useRouter();
  const { profile, loading, error } = useTherapist();
  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    if (loading) showLoader();
    else hideLoader();
  }, [loading, showLoader, hideLoader]);

  const therapistId = profile?._id?.toString() || null;

  if (error || !therapistId) {
    return (
      <Sidebar hideGlobalBreadcrumbs>
        <div className={styles.errorWrap}>
          <div className={styles.errorBox}>
            <Icon icon="solar:danger-triangle-bold" width={32} height={32} />
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
      <div className={styles.fullPage}>
        <WeekCalendar
          therapistId={therapistId}
          role="therapist"
          therapistName={profile?.name}
          sessionDurationMins={profile?.sessionDurationMins || 60}
        />
      </div>
    </Sidebar>
  );
}
