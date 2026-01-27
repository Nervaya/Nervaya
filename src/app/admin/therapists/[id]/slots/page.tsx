'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SlotManager from '@/components/Admin/SlotManager';
import { Therapist } from '@/types/therapist.types';
import styles from './styles.module.css';

export default function TherapistSlotsPage() {
  const params = useParams();
  const router = useRouter();
  const therapistId = params.id as string;
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTherapist = async () => {
    try {
      const response = await fetch(`/api/therapists/${therapistId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch therapist');
      }

      const result = await response.json();
      if (result.success) {
        setTherapist(result.data);
      } else {
        throw new Error('Therapist not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapistId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading therapist information...</div>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error || 'Therapist not found'}</p>
          <button
            onClick={() => router.push('/admin/therapists')}
            className={styles.backButton}
          >
            Back to Therapists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Slots</h1>
          <p className={styles.subtitle}>
            Therapist: <strong>{therapist.name}</strong>
          </p>
          {therapist.qualifications && therapist.qualifications.length > 0 && (
            <p className={styles.qualifications}>
              {therapist.qualifications.join(', ')}
            </p>
          )}
        </div>
        <button
          onClick={() => router.push('/admin/therapists')}
          className={styles.backButton}
        >
          ← Back to Therapists
        </button>
      </div>

      <SlotManager therapistId={therapistId} />
    </div>
  );
}
