'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/Sidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import BookingModal from '@/components/Booking/BookingModal';
import { Therapist } from '@/types/therapist.types';
import styles from './styles.module.css';

export default function TherapyCornerPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const response = await fetch('/api/therapists');
      if (!response.ok) throw new Error('Failed to fetch therapists');

      const result = await response.json();
      setTherapists(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (therapist: Therapist) => {
    try {
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
        router.push('/login');
        return;
      }

      setSelectedTherapist(therapist);
    } catch {
      router.push('/login');
    }
  };

  return (
    <Sidebar>
      <div className={styles.container}>
        <PageHeader
          title="Therapy Corner"
          subtitle="Finding the right therapist isn't easy."
          description="Based on your needs, we've curated a shortlist tailored just for you."
        />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>✨ Your Recommended Therapists</h2>

          {loading && <p>Loading therapists...</p>}
          {error && <p className={styles.error}>{error}</p>}

          {!loading && !error && therapists.length === 0 && (
            <p>No therapists found at the moment.</p>
          )}

          {!loading && !error && therapists.map((therapist) => (
            <div key={therapist._id} className={styles.therapistCard}>
              <div className={styles.therapistInfo}>
                <div
                  className={styles.avatar}
                  style={therapist.image ? { backgroundImage: `url(${therapist.image})` } : {}}
                />
                <div>
                  <h3>{therapist.name}</h3>
                  <p className={styles.credentials}>
                    {therapist.qualifications?.join(', ') || 'Professional Therapist'}
                  </p>
                  <p className={styles.details}>
                    Experience: {therapist.experience || 'N/A'} |
                    Languages: {therapist.languages?.join(', ') || 'N/A'}
                  </p>
                  <div className={styles.tags}>
                    {therapist.specializations?.map((spec) => (
                      <span key={spec}>{spec}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.actions}>
                <div className={styles.buttons}>
                  <button className={styles.outlineBtn}>View Profile</button>
                  <button
                    className={styles.primaryBtn}
                    onClick={() => handleBookAppointment(therapist)}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>

      {selectedTherapist && (
        <BookingModal
          therapistId={selectedTherapist._id}
          therapistName={selectedTherapist.name}
          onClose={() => setSelectedTherapist(null)}
          onSuccess={() => {
            setSelectedTherapist(null);
            router.push('/account');
          }}
        />
      )}
    </Sidebar>
  );
}
