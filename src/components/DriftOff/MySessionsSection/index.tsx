'use client';

import React, { useState, useEffect, useSyncExternalStore, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
import LottieLoader from '@/components/common/LottieLoader';
import Pagination from '@/components/common/Pagination';
import { driftOffApi } from '@/lib/api/driftOff';
import type { IDriftOffResponse } from '@/types/driftOff.types';
import type { VideoPlayerProps } from '@/components/DriftOff/VideoPlayer';
import { ICON_HEADPHONES, ICON_CLOCK } from '@/constants/icons';
import styles from './styles.module.css';

const VideoPlayerDynamic = dynamic(() => import('@/components/DriftOff/VideoPlayer'), {
  ssr: false,
}) as React.ComponentType<VideoPlayerProps>;

const emptySubscribe = () => () => {};
const getClient = () => true;
const getServer = () => false;

import { PAGE_SIZE_5 } from '@/lib/constants/pagination.constants';

interface MySessionsSectionProps {
  className?: string;
}

export default function MySessionsSection({ className = '' }: MySessionsSectionProps) {
  const hasMounted = useSyncExternalStore(emptySubscribe, getClient, getServer);
  const [responses, setResponses] = useState<IDriftOffResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadResponses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await driftOffApi.getResponses();
      if (res.success && res.data) {
        const sorted = [...res.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setResponses(sorted);
      } else {
        setResponses([]);
      }
    } catch {
      setError('Failed to load your sessions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isLoading) {
        loadResponses();
      }
    };

    const handleFocus = () => {
      if (!isLoading) {
        loadResponses();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadResponses, isLoading]);

  const renderSessionCard = (session: IDriftOffResponse) => {
    const videoUrl = session.assignedVideoUrl;
    const isReady = Boolean(videoUrl);
    const isPendingAssessment = !session.completedAt;
    const isPreparing = session.completedAt && !session.assignedVideoUrl;

    return (
      <div key={session._id} className={styles.sessionCard}>
        <div className={styles.cardHeader}>
          <div className={styles.dateInfo}>
            <span className={styles.dateLabel}>Purchased on</span>
            <span className={styles.dateValue}>{new Date(session.createdAt).toLocaleDateString()}</span>
          </div>
          <div
            className={`${styles.statusBadge} ${isReady ? styles.statusReady : isPreparing ? styles.statusPreparing : styles.statusPending}`}
          >
            {isReady ? 'Ready' : isPreparing ? 'Preparing' : 'Pending Action'}
          </div>
        </div>

        <div className={styles.cardContent}>
          {isReady ? (
            <div className={styles.videoContainer}>
              {hasMounted && (
                <VideoPlayerDynamic
                  url={videoUrl ?? ''}
                  width="100%"
                  height="100%"
                  controls
                  className={styles.videoPlayer}
                />
              )}
            </div>
          ) : (
            <div className={styles.placeholderBox}>
              <Icon
                icon={isPreparing ? ICON_CLOCK : ICON_HEADPHONES}
                width={40}
                height={40}
                className={styles.placeholderIcon}
              />
              <p className={styles.placeholderText}>
                {isPreparing
                  ? 'Our specialists are crafting your session...'
                  : 'Complete your assessment to get started.'}
              </p>
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          {isPendingAssessment && (
            <Link href={`/drift-off/assessment?orderId=${session.driftOffOrderId}`} className={styles.actionBtn}>
              Complete Assessment
            </Link>
          )}
          {isPreparing && <p className={styles.preparationNote}>Expected in 1-2 days</p>}
          {isReady && <p className={styles.readyNote}>Enjoy your personalized Deep Rest session.</p>}
        </div>
      </div>
    );
  };

  const totalSessions = responses.length;
  const totalPages = Math.ceil(totalSessions / PAGE_SIZE_5);
  const paginatedResponses = responses.slice((currentPage - 1) * PAGE_SIZE_5, currentPage * PAGE_SIZE_5);

  return (
    <section className={`${styles.section} ${className}`} aria-labelledby="my-sessions-heading">
      <div className={styles.contentWrapper}>
        {isLoading && (
          <div className={styles.center}>
            <LottieLoader width={160} height={160} />
          </div>
        )}

        {!isLoading && error && (
          <div className={styles.center}>
            <p className={styles.errorText}>{error}</p>
            <button type="button" className={styles.btn} onClick={() => loadResponses()}>
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className={styles.sessionsGrid}>
              {responses.length === 0 && (
                <div className={styles.noSessionsMessage}>
                  <h3 className={styles.noSessionsTitle}>Start Your Journey</h3>
                  <p className={styles.noSessionsText}>
                    Experience a personalized Deep Rest session designed just for you. Once you purchase a session, it
                    will appear here.
                  </p>
                  <Link href="/drift-off/payment" className={styles.btn}>
                    Buy Your First Session
                  </Link>
                </div>
              )}
              {paginatedResponses.map(renderSessionCard)}

              {responses.length > 0 && (
                <Link href="/drift-off/payment" className={styles.addSessionCard}>
                  <div className={styles.addIcon}>
                    <Icon icon="ph:plus-circle-bold" width={48} height={48} />
                  </div>
                  <h3 className={styles.addTitle}>Need another session?</h3>
                  <p className={styles.addText}>Every session is uniquely crafted for your current state.</p>
                  <div className={styles.btn}>Buy New Session</div>
                </Link>
              )}
            </div>

            <div className={styles.paginationWrapper}>
              <Pagination
                page={currentPage}
                limit={PAGE_SIZE_5}
                total={totalSessions}
                totalPages={Math.max(1, totalPages)}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
