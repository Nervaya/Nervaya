'use client';

import { useState, useEffect, useMemo } from 'react';
import { therapistsApi } from '@/lib/api/therapists';
import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import BookingModal from '@/components/Booking/BookingModal';
import Pagination from '@/components/common/Pagination';
import LottieLoader from '@/components/common/LottieLoader';
import { PAGE_SIZE_5 } from '@/lib/constants/pagination.constants';
import { Therapist } from '@/types/therapist.types';
import { trackViewTherapistProfile, trackStartBooking } from '@/utils/analytics';
import containerStyles from '@/app/dashboard/styles.module.css';
import styles from './styles.module.css';

export default function TherapyCornerPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [page, setPage] = useState(1);

  const limit = PAGE_SIZE_5;
  const total = therapists.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedTherapists = useMemo(
    () => therapists.slice((page - 1) * limit, page * limit),
    [therapists, page, limit],
  );

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const result = await therapistsApi.getAll();
      setTherapists(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (therapist: Therapist) => {
    trackStartBooking({ therapist_id: therapist._id, therapist_name: therapist.name });
    setSelectedTherapist(therapist);
  };

  const handleViewProfile = (therapist: Therapist) => {
    trackViewTherapistProfile({ therapist_id: therapist._id, therapist_name: therapist.name });
  };

  return (
    <Sidebar>
      <div className={containerStyles.container}>
        <PageHeader
          title="Therapy Corner"
          subtitle="Finding the right therapist isn't easy."
          description="Based on your needs, we've curated a shortlist tailored just for you."
        />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>✨ Your Recommended Therapists</h2>

          {loading && (
            <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
              <LottieLoader width={200} height={200} />
            </div>
          )}
          {error && <p className={styles.error}>{error}</p>}

          {!loading && !error && therapists.length === 0 && <p>No therapists found at the moment.</p>}

          {!loading && !error && (
            <>
              <ul className={styles.therapistList} aria-label="Recommended therapists">
                {paginatedTherapists.map((therapist) => (
                  <li
                    key={therapist._id}
                    className={styles.therapistCard}
                    onMouseEnter={() => handleViewProfile(therapist)}
                  >
                    <div className={styles.therapistInfo}>
                      <div
                        className={styles.avatar}
                        style={therapist.image ? { backgroundImage: `url(${therapist.image})` } : {}}
                        role="img"
                        aria-label={`${therapist.name} profile picture`}
                      />
                      <div>
                        <h3>{therapist.name}</h3>
                        <p className={styles.credentials}>
                          {therapist.qualifications?.join(', ') || 'Professional Therapist'}
                        </p>
                        <p className={styles.details}>
                          Experience: {therapist.experience || 'N/A'} | Languages:{' '}
                          {therapist.languages?.join(', ') || 'N/A'}
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
                        <button className={styles.primaryBtn} onClick={() => handleBookAppointment(therapist)}>
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {total >= 0 && (
                <div className={styles.paginationWrap}>
                  <Pagination
                    page={page}
                    limit={limit}
                    total={total}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    ariaLabel="Recommended therapists pagination"
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {selectedTherapist && (
        <BookingModal
          therapistId={selectedTherapist._id}
          therapistName={selectedTherapist.name}
          onClose={() => setSelectedTherapist(null)}
          onSuccess={() => {}}
        />
      )}
    </Sidebar>
  );
}
