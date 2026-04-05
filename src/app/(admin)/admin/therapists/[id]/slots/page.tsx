'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { therapistsApi } from '@/lib/api/therapists';
import { WeekCalendar } from '@/components/WeekCalendar';
import { Therapist } from '@/types/therapist.types';
import { useLoading } from '@/context/LoadingContext';
import { Icon } from '@iconify/react';
import { ICON_ARROW_LEFT } from '@/constants/icons';
import styles from './styles.module.css';

export default function TherapistSlotsPage() {
  const params = useParams();
  const router = useRouter();
  const therapistId = params.id as string;
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    if (loading) showLoader('Loading therapist information...');
    else hideLoader();
  }, [loading, showLoader, hideLoader]);

  const fetchTherapist = useCallback(async () => {
    try {
      const result = await therapistsApi.getById(therapistId);
      if (result.success && result.data) {
        setTherapist(result.data);
      } else {
        throw new Error('Therapist not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    fetchTherapist();
  }, [fetchTherapist]);

  if (error || !therapist) {
    return (
      <div className={styles.errorWrap}>
        <div className={styles.errorBox}>
          <Icon icon="solar:danger-triangle-bold" width={32} height={32} />
          <p>{error || 'Therapist not found'}</p>
          <button onClick={() => router.push('/admin/therapists')} className={styles.errorBtn}>
            <Icon icon={ICON_ARROW_LEFT} width={14} height={14} />
            Back to Therapists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fullPage}>
      <WeekCalendar
        therapistId={therapistId}
        role="admin"
        therapistName={therapist.name}
        sessionDurationMins={therapist.sessionDurationMins || 60}
        onBack={() => router.push('/admin/therapists')}
      />
    </div>
  );
}
