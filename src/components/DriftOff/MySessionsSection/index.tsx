'use client';

import React, { useState, useEffect, useSyncExternalStore, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
import LottieLoader from '@/components/common/LottieLoader';
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

interface MySessionsSectionProps {
  className?: string;
}

export default function MySessionsSection({ className = '' }: MySessionsSectionProps) {
  const hasMounted = useSyncExternalStore(emptySubscribe, getClient, getServer);
  const [response, setResponse] = useState<IDriftOffResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResponses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await driftOffApi.getResponses();
      if (res.success && res.data?.length) {
        const sorted = [...res.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latestResponse = sorted[0] ?? null;
        setResponse(latestResponse);
      } else {
        setResponse(null);
      }
    } catch {
      setError('Failed to load your session. Please try again.');
      setResponse(null);
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
            <button type="button" className={styles.btn} onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && !response && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden>
              <Icon icon={ICON_HEADPHONES} width={48} height={48} />
            </div>
            <h3 className={styles.emptyTitle}>No session yet</h3>
            <p className={styles.emptyText}>You haven&apos;t purchased a Deep Rest Session yet.</p>
            <Link href="/drift-off/payment" className={styles.btn}>
              Get Your Session
            </Link>
          </div>
        )}

        {!isLoading && !error && response && !response.completedAt && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden>
              <Icon icon={ICON_CLOCK} width={48} height={48} />
            </div>
            <h3 className={styles.emptyTitle}>Assessment Pending</h3>
            <p className={styles.emptyText}>
              You have purchased a Deep Rest Session but haven&apos;t finished the assessment yet. Please complete it so
              our specialists can craft your personalized session.
            </p>
            <Link href={`/drift-off/assessment?orderId=${response.driftOffOrderId}`} className={styles.btn}>
              Complete Assessment
            </Link>
          </div>
        )}

        {!isLoading && !error && response && response.completedAt && !response.assignedVideoUrl && (
          <div className={styles.pendingState}>
            <div className={styles.pendingIcon} aria-hidden>
              <Icon icon={ICON_CLOCK} width={48} height={48} />
            </div>
            <h3 className={styles.pendingTitle}>Your session is being prepared</h3>
            <p className={styles.pendingText}>
              Our specialists are reviewing your assessment answers and crafting a personalized 25-min Deep Rest Session
              just for you. This usually takes 1–2 days. We&apos;ll notify you when it&apos;s ready.
            </p>
            <Link href="/drift-off" className={styles.btnOutline}>
              Back to Home
            </Link>
          </div>
        )}

        {!isLoading && !error && response?.assignedVideoUrl && (
          <div className={styles.sessionState}>
            <div className={styles.sessionHeader}>
              <h3 className={styles.sessionTitle}>Your Personalized Session</h3>
              <p className={styles.sessionSubtitle}>Curated specially for you by our sleep specialists</p>
            </div>
            <div className={styles.videoWrapper}>
              {hasMounted && (
                <VideoPlayerDynamic
                  url={response.assignedVideoUrl}
                  width="100%"
                  height="100%"
                  controls
                  className={styles.videoPlayer}
                />
              )}
            </div>
            <p className={styles.sessionNote}>
              Listen to this session anytime — especially before bedtime for best results.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
