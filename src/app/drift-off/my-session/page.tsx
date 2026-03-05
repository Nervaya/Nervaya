'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import Sidebar from '@/components/Sidebar/LazySidebar';
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

export default function DriftOffMySessionPage() {
  const hasMounted = useSyncExternalStore(emptySubscribe, getClient, getServer);
  const [response, setResponse] = useState<IDriftOffResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await driftOffApi.getResponses();
        if (res.success && res.data?.length) {
          const completed = res.data
            .filter((r) => r.completedAt !== null)
            .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime());
          setResponse(completed[0] ?? null);
        }
      } catch {
        setError('Failed to load your session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Sidebar>
      <div className={styles.wrapper}>
        <h1 className={styles.heading}>My Deep Rest Session</h1>

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
            <h2 className={styles.emptyTitle}>No session yet</h2>
            <p className={styles.emptyText}>You haven&apos;t purchased a Deep Rest Session yet.</p>
            <Link href="/drift-off/payment" className={styles.btn}>
              Get Your Session
            </Link>
          </div>
        )}

        {!isLoading && !error && response && !response.assignedVideoUrl && (
          <div className={styles.pendingState}>
            <div className={styles.pendingIcon} aria-hidden>
              <Icon icon={ICON_CLOCK} width={48} height={48} />
            </div>
            <h2 className={styles.pendingTitle}>Your session is being prepared</h2>
            <p className={styles.pendingText}>
              Our specialists are reviewing your assessment answers and crafting a personalized 25-min Deep Rest Session
              just for you. This usually takes 1–2 days. We&apos;ll notify you when it&apos;s ready.
            </p>
            <Link href="/drift-off" className={styles.btnOutline}>
              Back to Drift Off
            </Link>
          </div>
        )}

        {!isLoading && !error && response?.assignedVideoUrl && (
          <div className={styles.sessionState}>
            <div className={styles.sessionHeader}>
              <h2 className={styles.sessionTitle}>Your Personalized Session</h2>
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
    </Sidebar>
  );
}
