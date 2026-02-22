'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { therapistsApi } from '@/lib/api/therapists';
import SlotManager from '@/components/Admin/SlotManager';
import ConsultingHoursManager from '@/components/Admin/ConsultingHoursManager';
import { Therapist } from '@/types/therapist.types';
import LottieLoader from '@/components/common/LottieLoader';
import PageHeader from '@/components/PageHeader/PageHeader';
import styles from './styles.module.css';
import { FaArrowLeft } from 'react-icons/fa6';

export default function TherapistSlotsPage() {
  const params = useParams();
  const router = useRouter();
  const therapistId = params.id as string;
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleSlotUpdate = useCallback(() => {}, []);

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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <LottieLoader width={60} height={60} />
          <span>Loading therapist information...</span>
        </div>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error || 'Therapist not found'}</p>
          <button onClick={() => router.push('/admin/therapists')} className={styles.backButton}>
            <FaArrowLeft />
            Back to Therapists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="Manage Slots"
        subtitle={`Therapist: ${therapist.name}`}
        actions={
          <button type="button" onClick={() => router.push('/admin/therapists')} className={styles.backButton}>
            <FaArrowLeft aria-hidden />
            Back to Therapists
          </button>
        }
      />

      <ConsultingHoursManager therapistId={therapistId} onUpdate={handleSlotUpdate} />

      <SlotManager therapistId={therapistId} onSlotUpdate={handleSlotUpdate} />
    </div>
  );
}
