'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import { LottieLoader } from '@/components/common';
import BookingModal from '@/components/Booking/BookingModal';
import { therapistsApi } from '@/lib/api/therapists';
import StatusState from '@/components/common/StatusState';
import { Therapist } from '@/types/therapist.types';
import containerStyles from '@/app/(customer)/dashboard/styles.module.css';
import styles from './styles.module.css';
import { Icon } from '@iconify/react';
import { getEmbedUrl } from '@/lib/utils/video.utils';
import { ICON_QUOTES } from '@/constants/icons';

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

  const embedUrl = therapist?.introVideoUrl ? getEmbedUrl(therapist.introVideoUrl) : null;

  return (
    <Sidebar className={styles.pageContentWhite}>
      <div className={containerStyles.container} style={{ padding: 0, maxWidth: '100%', overflowX: 'hidden' }}>
        <section
          style={{ display: 'flex', flexDirection: 'column', width: '100%', background: '#faf5ff', minHeight: '100vh' }}
        >
          {loading && (
            <div
              className={styles.loadingWrap}
              style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LottieLoader width={160} height={160} />
            </div>
          )}

          {!loading && error && (
            <StatusState
              type="error"
              title="Profile Not Found"
              message={
                error ||
                "We couldn't find the therapist profile you're looking for. It may have been moved or is no longer available."
              }
            />
          )}

          {!loading && !error && therapist && (
            <>
              {/* Top Section */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '60px',
                  padding: '60px 8%',
                  alignItems: 'center',
                  background: '#ffffff',
                  borderRadius: '12px',
                  margin: '20px 4%',
                }}
              >
                <div
                  style={{
                    flex: '1 1 300px',
                    maxWidth: '420px',
                    aspectRatio: '1/1',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                    boxShadow: '0 20px 50px rgba(139, 92, 246, 0.15)',
                    overflow: 'hidden',
                    margin: '0 auto',
                  }}
                >
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={`${therapist.name} - Intro Video`}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : therapist.introVideoUrl ? (
                    <video
                      controls
                      src={therapist.introVideoUrl}
                      poster={therapist.introVideoThumbnail || therapist.image || ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    >
                      <source src={therapist.introVideoUrl} />
                      Your browser does not support the video tag.
                    </video>
                  ) : therapist.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={therapist.image}
                      alt={therapist.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a78bfa',
                      }}
                    >
                      No Image Available
                    </div>
                  )}
                </div>

                <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <h1 style={{ margin: 0, color: '#7c3aed', fontSize: '2.2rem', fontWeight: 500 }}>
                    {therapist.name}&apos;s Bio
                  </h1>

                  <div
                    style={{
                      color: '#475569',
                      fontSize: '1.05rem',
                      lineHeight: '1.8',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                    }}
                  >
                    {therapist.bioLong ? (
                      <p style={{ margin: 0 }}>{therapist.bioLong}</p>
                    ) : therapist.bio ? (
                      <p style={{ margin: 0 }}>{therapist.bio}</p>
                    ) : (
                      <>
                        <p style={{ margin: 0 }}>
                          Trouble unwinding at night? Our expert therapists gently help you release anxiety &amp;
                          stress, restore your natural sleep rhythm, and wake up feeling lighter and more refreshed at
                          day.
                        </p>
                        <p style={{ margin: 0 }}>
                          Our compassionate approach combines evidence-based techniques with personalized care to
                          support your mental wellness journey.
                        </p>
                      </>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: '12px',
                      paddingLeft: '18px',
                      borderLeft: '4px solid #a855f7',
                      color: '#9333ea',
                      fontStyle: 'italic',
                      fontSize: '1.15rem',
                      fontWeight: 500,
                      lineHeight: '1.6',
                    }}
                  >
                    &quot;
                    {therapist.quote || 'Healing is not a destination, but a journey of self-discovery and growth.'}
                    &quot;
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setOpenBooking(true)}
                      style={{
                        padding: '12px 28px',
                        background: '#7c3aed',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </div>

              {/* Middle Section - Message to You */}
              <div
                style={{
                  position: 'relative',
                  background: '#f3e8ff',
                  padding: '80px 8%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '24px',
                  overflow: 'hidden',
                  borderTop: '1px solid rgba(168, 85, 247, 0.2)',
                  borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <Icon icon={ICON_QUOTES} style={{ color: '#a855f7', fontSize: '3.5rem', marginBottom: '-10px' }} />

                  <h2 style={{ margin: 0, color: '#7c3aed', fontSize: '1.25rem', fontWeight: 600 }}>Message to You</h2>
                </div>

                <p
                  style={{
                    margin: 0,
                    maxWidth: '850px',
                    color: '#5b21b6',
                    fontSize: '1.15rem',
                    lineHeight: '1.9',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {therapist.messageToClient ||
                    "Trouble unwinding at night? Our expert therapists gently help you release anxiety & stress, restore your natural sleep rhythm, and wake up feeling lighter and more refreshed at day. You deserve peace of mind and restful nights. Let's work together to help you rediscover the calm and balance you've been seeking."}
                </p>

                <Icon
                  icon={ICON_QUOTES}
                  style={{
                    position: 'absolute',
                    right: '10%',
                    bottom: '30px',
                    color: '#c084fc',
                    fontSize: '8rem',
                    opacity: 0.4,
                    transform: 'scaleX(-1)',
                    zIndex: 1,
                  }}
                />
              </div>

              {/* Bottom Section - Testimonials */}
              <div
                style={{
                  padding: '80px 8%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '50px',
                  background: '#faf5ff',
                  borderRadius: '12px',
                  margin: '20px 4%',
                }}
              >
                <h2 style={{ margin: 0, color: '#9333ea', fontSize: '1.1rem', fontWeight: 500 }}>Testimonials</h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                    width: '100%',
                    maxWidth: '1200px',
                  }}
                >
                  {(therapist.testimonials?.length
                    ? therapist.testimonials
                    : [
                        {
                          name: 'Sarah M.',
                          clientSince: 'Client since 2023',
                          message:
                            'Anu helped me navigate through the darkest period of my life. Her compassionate approach and practical strategies made all the difference.',
                        },
                        {
                          name: 'James K.',
                          clientSince: 'Client since 2022',
                          message:
                            "I was skeptical about therapy, but Anu's warm demeanor and professional expertise changed my perspective. Highly recommended!",
                        },
                        {
                          name: 'Maria L.',
                          clientSince: 'Client since 2024',
                          message:
                            "The tools and insights I gained from my sessions with Anu have been life-changing. She truly cares about her clients' well-being.",
                        },
                      ]
                  ).map((testimonial) => (
                    <div
                      key={`${testimonial.name}-${testimonial.clientSince}`}
                      style={{
                        background: '#ffffff',
                        borderRadius: '20px',
                        padding: '36px',
                        boxShadow: '0 12px 36px rgba(139, 92, 246, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        border: '1px solid rgba(216, 180, 254, 0.3)',
                      }}
                    >
                      <Icon icon={ICON_QUOTES} style={{ color: '#c084fc', fontSize: '3rem' }} />

                      <p style={{ margin: 0, color: '#475569', lineHeight: '1.8', fontSize: '1.05rem', flex: 1 }}>
                        &quot;{testimonial.message}&quot;
                      </p>

                      <div
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <span style={{ color: '#9333ea', fontWeight: 500, fontSize: '1rem' }}>{testimonial.name}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {testimonial.clientSince || 'Client'}
                        </span>
                      </div>
                    </div>
                  ))}
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
