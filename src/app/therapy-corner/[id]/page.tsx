'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/LazySidebar';
import LottieLoader from '@/components/common/LottieLoader';
import BookingModal from '@/components/Booking/BookingModal';
import { therapistsApi } from '@/lib/api/therapists';
import { Therapist } from '@/types/therapist.types';
import containerStyles from '@/app/dashboard/styles.module.css';
import styles from './styles.module.css';

export default function TherapistProfilePage() {
  const params = useParams<{ id: string }>();
  const therapistId = params?.id as string;

  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openBooking, setOpenBooking] = useState(false);

  useEffect(() => {
    const fetchTherapist = async () => {
      if (!therapistId) {
        setError('Invalid therapist id');
        setLoading(false);
        return;
      }

      try {
        const response = await therapistsApi.getById(therapistId);
        if (response.success && response.data) {
          setTherapist(response.data);
        } else {
          setError('Therapist not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch therapist details');
      } finally {
        setLoading(false);
      }
    };

    void fetchTherapist();
  }, [therapistId]);

  return (
    <Sidebar className={styles.pageContentWhite}>
      <div className={containerStyles.container}>
        <section className={styles.section}>
          {loading && (
            <div className={styles.loadingWrap}>
              <LottieLoader width={160} height={160} />
            </div>
          )}

          {!loading && error && <p className={styles.error}>{error}</p>}

          {!loading && !error && therapist && (
            <>
              <div className={styles.profileTop}>
                <div className={styles.mediaPane}>
                  {therapist.introVideoUrl ? (
                    <video
                      controls
                      poster={therapist.introVideoThumbnail || therapist.image || ''}
                      className={styles.videoPlayer}
                    >
                      <source src={therapist.introVideoUrl} />
                    </video>
                  ) : therapist.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={therapist.image} alt={therapist.name} className={styles.profileImage} />
                  ) : (
                    <div className={styles.mediaFallback}>No Media Available</div>
                  )}
                </div>

                <div className={styles.contentPane}>
                  <h1>{therapist.name}</h1>
                  <p className={styles.credentials}>{therapist.qualifications?.join(', ') || 'Therapist'}</p>
                  <p className={styles.bio}>
                    {therapist.bioLong || therapist.bio || 'Profile details will be updated soon.'}
                  </p>
                  {therapist.quote && <blockquote className={styles.quote}>{therapist.quote}</blockquote>}
                  <div className={styles.topActions}>
                    <button type="button" className={styles.primaryBtn} onClick={() => setOpenBooking(true)}>
                      Book Appointment
                    </button>
                    <Link href="/therapy-corner" className={styles.secondaryBtn}>
                      Back to Therapists
                    </Link>
                  </div>
                </div>
              </div>

              <div className={styles.messageSection}>
                <h2>Message to You</h2>
                <p>
                  {therapist.messageToClient ||
                    'You deserve peace of mind and restful nights. We are here to support your healing journey.'}
                </p>
              </div>

              <div className={styles.metaGrid}>
                <div className={styles.metaCard}>
                  <h3>Experience</h3>
                  <p>{therapist.experience || 'Not specified'}</p>
                </div>
                <div className={styles.metaCard}>
                  <h3>Languages</h3>
                  <p>{therapist.languages?.join(', ') || 'Not specified'}</p>
                </div>
                <div className={styles.metaCard}>
                  <h3>Specializations</h3>
                  <p>{therapist.specializations?.join(', ') || 'Not specified'}</p>
                </div>
                <div className={styles.metaCard}>
                  <h3>Session</h3>
                  <p>
                    {therapist.sessionFee && therapist.sessionDurationMins
                      ? `₹${therapist.sessionFee} for ${therapist.sessionDurationMins} mins`
                      : 'Pricing on request'}
                  </p>
                </div>
              </div>

              <div className={styles.testimonialsSection}>
                <h2>Testimonials</h2>
                <div className={styles.testimonialGrid}>
                  {(therapist.testimonials?.length ? therapist.testimonials : []).map((testimonial) => (
                    <article
                      key={`${testimonial.name}-${testimonial.clientSince || 'unknown'}-${testimonial.message.slice(0, 24)}`}
                      className={styles.testimonialCard}
                    >
                      <p className={styles.testimonialMessage}>&ldquo;{testimonial.message}&rdquo;</p>
                      <div className={styles.testimonialMeta}>
                        <strong>{testimonial.name}</strong>
                        {testimonial.clientSince && <span>{testimonial.clientSince}</span>}
                      </div>
                    </article>
                  ))}
                  {!therapist.testimonials?.length && (
                    <article className={styles.testimonialCard}>
                      <p className={styles.testimonialMessage}>
                        &ldquo;Clients report improved sleep quality and better emotional balance after sessions.&rdquo;
                      </p>
                      <div className={styles.testimonialMeta}>
                        <strong>Nervaya Client</strong>
                      </div>
                    </article>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {openBooking && therapist && (
        <BookingModal
          therapistId={therapist._id}
          therapistName={therapist.name}
          onClose={() => setOpenBooking(false)}
          onSuccess={() => {}}
        />
      )}
    </Sidebar>
  );
}
