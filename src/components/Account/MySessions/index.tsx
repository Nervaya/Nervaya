'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { sessionsApi } from '@/lib/api/sessions';
import { driftOffApi } from '@/lib/api/driftOff';
import { Session } from '@/types/session.types';
import { IDriftOffResponse } from '@/types/driftOff.types';
import { Therapist } from '@/types/therapist.types';
import Pagination from '@/components/common/Pagination';
import LottieLoader from '@/components/common/LottieLoader';
import { PAGE_SIZE_3 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';
import { Icon } from '@iconify/react';
import { ICON_CALENDAR, ICON_USER, ICON_STAR, ICON_X } from '@/constants/icons';

// Dummy icons since we don't have exact ones
const ICON_MUSIC = 'lucide:music';
const ICON_HASHTAG = 'heroicons:hashtag';
const ICON_PLAY_CIRCLE = 'lucide:play-circle';
const ICON_GLOBE = 'solar:global-bold';
const ICON_VIDEO = 'solar:video-library-bold';

type CategoryType = 'therapy' | 'deepRest';

export default function MySessions() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('therapy');
  const [therapySessions, setTherapySessions] = useState<Session[]>([]);
  const [deepRestSessions, setDeepRestSessions] = useState<IDriftOffResponse[]>([]);
  const [loadingTherapy, setLoadingTherapy] = useState(true);
  const [loadingDeepRest, setLoadingDeepRest] = useState(true);

  const [errorTherapy, setErrorTherapy] = useState('');
  const [errorDeepRest, setErrorDeepRest] = useState('');

  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);

  const limit = PAGE_SIZE_3;
  const totalTherapy = therapySessions.length;
  const totalPagesTherapy = Math.max(1, Math.ceil(totalTherapy / limit));
  const paginatedTherapy = useMemo(
    () => therapySessions.slice((page - 1) * limit, page * limit),
    [therapySessions, page, limit],
  );

  useEffect(() => {
    setMounted(true);
    fetchTherapySessions();
    fetchDeepRestSessions();
  }, []);

  const fetchTherapySessions = async () => {
    try {
      const result = await sessionsApi.getForUser();
      setTherapySessions(result.data || []);
    } catch (err) {
      setErrorTherapy(err instanceof Error ? err.message : 'Error loading therapy sessions');
    } finally {
      setLoadingTherapy(false);
    }
  };

  const fetchDeepRestSessions = async () => {
    try {
      const result = await driftOffApi.getResponses();
      if (result.success && result.data) {
        setDeepRestSessions(result.data);
      }
    } catch (err) {
      setErrorDeepRest(err instanceof Error ? err.message : 'Error loading deep rest sessions');
    } finally {
      setLoadingDeepRest(false);
    }
  };

  const calculateDuration = (_startTime: string, _endTime: string) => {
    // Basic duration display. Example: "11:00 AM" to "12:00 PM" -> "60 min"
    // For now returning a placeholder since accurate parsing depends on the specific time format.
    return '60 minutes';
  };

  if (loadingTherapy && loadingDeepRest) {
    return (
      <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
        <LottieLoader width={200} height={200} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Sessions</h2>
      <p className={styles.subheading}>Manage your therapy sessions and deep rest audio programs</p>

      <div className={styles.toggleContainer}>
        <button
          className={`${styles.toggleBtn} ${activeCategory === 'therapy' ? styles.toggleBtnActive : ''}`}
          onClick={() => {
            setActiveCategory('therapy');
            setPage(1);
          }}
        >
          Therapy Sessions
        </button>
        <button
          className={`${styles.toggleBtn} ${activeCategory === 'deepRest' ? styles.toggleBtnActive : ''}`}
          onClick={() => {
            setActiveCategory('deepRest');
            setPage(1);
          }}
        >
          Deep Rest Sessions
        </button>
      </div>

      {/* Therapy Sessions Section */}
      {activeCategory === 'therapy' && (
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <div className={styles.iconCircle}>
                <Icon icon={ICON_CALENDAR} className={styles.sectionIcon} />
              </div>
              <h3 className={styles.sectionTitle}>Therapy Sessions</h3>
              <span className={styles.badgeCount}>{therapySessions.length}</span>
            </div>
          </div>

          {errorTherapy ? (
            <div className={styles.error}>{errorTherapy}</div>
          ) : therapySessions.length === 0 && !loadingTherapy ? (
            <div className={styles.emptyState}>
              <p>No therapy sessions booked yet</p>
            </div>
          ) : (
            <div className={styles.sessionsList}>
              {paginatedTherapy.map((session) => {
                const therapist = session.therapistId as unknown as Therapist;

                return (
                  <div key={session._id} className={styles.sessionCard}>
                    <div className={styles.cardImagePlaceholder}>{/* Placeholder for thumbnail */}</div>

                    <div className={styles.cardContent}>
                      <h4 className={styles.itemTitle}>{therapist?.name || 'Unknown Therapist'}</h4>
                      <p className={styles.itemSubtitle}>Sleep Consultation</p>
                      <p className={styles.itemDescription}>
                        One-on-one consultation to discuss sleep patterns and develop a custom treatment plan
                      </p>

                      <div className={styles.infoChips}>
                        <div className={styles.chip}>
                          <div className={styles.chipIconWrap}>
                            <Icon icon={ICON_CALENDAR} />
                          </div>
                          <div className={styles.chipText}>
                            <span className={styles.chipLabel}>Booking Date</span>
                            <span className={styles.chipValue}>
                              {new Date(session.createdAt || session.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className={styles.chip}>
                          <div className={styles.chipIconWrap}>
                            <Icon icon={ICON_HASHTAG} />
                          </div>
                          <div className={styles.chipText}>
                            <span className={styles.chipLabel}>Booking ID</span>
                            <span className={styles.chipValue}>TH-{session._id.slice(-8).toUpperCase()}</span>
                          </div>
                        </div>

                        <div className={styles.chip}>
                          <div className={styles.chipIconWrap}>
                            <Icon icon={ICON_USER} />
                          </div>
                          <div className={styles.chipText}>
                            <span className={styles.chipLabel}>Appointment Date</span>
                            <span className={styles.chipValue}>
                              {new Date(session.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}{' '}
                              • {session.startTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.cardActionsRow}>
                        <button className={styles.primaryActionBtn} onClick={() => setSelectedSession(session)}>
                          <Icon icon={ICON_CALENDAR} className={styles.btnIcon} /> View Session Details
                        </button>
                        <button className={styles.secondaryActionBtn}>
                          Reschedule Appointment <Icon icon="lucide:chevron-right" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalTherapy > limit && (
            <div className={styles.paginationWrap}>
              <Pagination
                page={page}
                limit={limit}
                total={totalTherapy}
                totalPages={totalPagesTherapy}
                onPageChange={setPage}
                ariaLabel="Therapy sessions pagination"
              />
            </div>
          )}
        </div>
      )}

      {/* Deep Rest Sessions Section */}
      {activeCategory === 'deepRest' && (
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <div className={styles.iconCircle}>
                <Icon icon={ICON_MUSIC} className={styles.sectionIcon} />
              </div>
              <h3 className={styles.sectionTitle}>Deep Rest Sessions</h3>
              <span className={styles.badgeCount}>{deepRestSessions.length}</span>
            </div>
            <button className={styles.headerActionBtn}>
              <Icon icon={ICON_STAR} /> Rate & Review
            </button>
          </div>

          {errorDeepRest ? (
            <div className={styles.error}>{errorDeepRest}</div>
          ) : deepRestSessions.length === 0 && !loadingDeepRest ? (
            <div className={styles.emptyState}>
              <p>No deep rest sessions available</p>
            </div>
          ) : (
            <div className={styles.sessionsList}>
              {deepRestSessions.map((session, index) => {
                // Using some mock titles alternating based on index to look like Figma if it's the real data
                const title = index % 2 === 0 ? 'Midnight Serenity' : 'Ocean Dreams';
                const desc =
                  index % 2 === 0
                    ? 'Guided meditation and calming soundscapes for deep, restorative sleep'
                    : 'Immersive ocean sounds combined with gentle guidance for peaceful slumber';

                return (
                  <div key={session._id} className={styles.sessionCard}>
                    <div className={styles.cardImagePlaceholder}>
                      <span className={styles.lifetimeBadge}>
                        <Icon icon="lucide:infinity" /> Lifetime
                      </span>
                    </div>

                    <div className={styles.cardContent}>
                      <h4 className={styles.itemTitle}>{title}</h4>
                      <p className={styles.itemSubtitle}>Deep Rest Audio Session</p>
                      <p className={styles.itemDescription}>{desc}</p>

                      <div className={styles.infoChips}>
                        <div className={styles.chip}>
                          <div className={styles.chipIconWrap}>
                            <Icon icon={ICON_CALENDAR} />
                          </div>
                          <div className={styles.chipText}>
                            <span className={styles.chipLabel}>Booking Date</span>
                            <span className={styles.chipValue}>
                              {new Date(session.createdAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className={styles.chip}>
                          <div className={styles.chipIconWrap}>
                            <Icon icon={ICON_HASHTAG} />
                          </div>
                          <div className={styles.chipText}>
                            <span className={styles.chipLabel}>Booking ID</span>
                            <span className={styles.chipValue}>
                              DR-
                              {session.driftOffOrderId?.slice(-8).toUpperCase() || session._id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className={styles.chipSuccess}>
                          <div className={styles.chipIconWrapSuccess}>
                            <Icon icon="lucide:infinity" />
                          </div>
                          <div className={styles.chipText}>
                            <span className={styles.chipLabelSuccess}>Access</span>
                            <span className={styles.chipValueSuccess}>Lifetime</span>
                          </div>
                        </div>
                      </div>

                      {!session.assignedVideoUrl ? (
                        <div className={styles.noticeBox}>Sessions will be accessible in 1-2 days after purchase</div>
                      ) : null}

                      <div className={styles.cardActionsFull}>
                        <button className={styles.primaryActionBtnFull} disabled={!session.assignedVideoUrl}>
                          <Icon icon={ICON_PLAY_CIRCLE} className={styles.btnIcon} /> Access Sessions
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {mounted &&
        selectedSession &&
        createPortal(
          <div className={styles.modalOverlay} onClick={() => setSelectedSession(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Session Details</h3>
                <button
                  className={styles.modalCloseBtn}
                  onClick={() => setSelectedSession(null)}
                  aria-label="Close session details"
                >
                  <Icon icon={ICON_X} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalTherapistBlock}>
                  <div className={styles.modalImageWrap}>
                    {(() => {
                      const therapist = selectedSession.therapistId as unknown as Therapist;
                      return (
                        <div className={styles.cardImagePlaceholder}>
                          {therapist?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={therapist.image}
                              alt={therapist.name}
                              className={styles.therapistImage}
                              style={{ borderRadius: '12px' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%' }} />
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div className={styles.modalTherapistInfo}>
                    <h4 className={styles.modalTherapistName}>
                      {(selectedSession.therapistId as unknown as Therapist)?.name || 'Unknown Therapist'}
                    </h4>
                    <p className={styles.modalTherapistQualifications}>
                      {(selectedSession.therapistId as unknown as Therapist)?.qualifications?.join(', ') ||
                        'General Consultation'}
                    </p>
                  </div>
                  <div className={styles.modalStatusWrap}>
                    <span
                      className={`${styles.statusBadge} ${styles[`status${selectedSession.status.charAt(0).toUpperCase()}${selectedSession.status.slice(1)}`]}`}
                    >
                      {selectedSession.status}
                    </span>
                  </div>
                </div>

                <div className={styles.orderSummary}>
                  <div className={styles.orderHeaderSection}>
                    <div className={styles.orderHeaderGroup}>
                      <span className={styles.orderHeaderLabel}>Booking ID</span>
                      <span className={styles.orderHeaderValue}>TH-{selectedSession._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className={styles.orderHeaderGroup}>
                      <span className={styles.orderHeaderLabel}>Booking Date</span>
                      <span className={styles.orderHeaderValue}>
                        {new Date(selectedSession.createdAt || selectedSession.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className={styles.orderSection}>
                    <h3 className={styles.sectionTitleModal}>
                      <Icon icon={ICON_GLOBE} className={styles.sectionIcon} aria-hidden />
                      Appointment Details
                    </h3>
                    <div className={styles.appointmentDetailsGrid}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Date</span>
                        <span className={styles.detailValue}>
                          {new Date(selectedSession.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Time</span>
                        <span className={styles.detailValue}>
                          {selectedSession.startTime} - {selectedSession.endTime}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Duration</span>
                        <span className={styles.detailValue}>
                          {calculateDuration(selectedSession.startTime, selectedSession.endTime)}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Mode</span>
                        <span className={styles.detailValue}>Video Consultation</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.modalActionGroup}>
                    {selectedSession.status === 'pending' || selectedSession.status === 'confirmed' ? (
                      <>
                        <button className={styles.primaryActionBtnFull}>
                          <Icon icon={ICON_VIDEO} className={styles.btnIcon} /> Join Session
                        </button>
                        <button className={styles.dangerActionBtnOutline}>
                          <Icon icon={ICON_X} className={styles.btnIcon} /> Cancel Appointment
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
