'use client';

import { useState, useEffect, useSyncExternalStore, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { ICON_PLUS_CIRCLE } from '@/constants/icons';
import { LottieLoader, Pagination } from '@/components/common';
import { driftOffApi } from '@/lib/api/driftOff';
import type { IDriftOffResponse } from '@/types/driftOff.types';
import { PAGE_SIZE_5 } from '@/lib/constants/pagination.constants';
import { SessionCard } from './SessionCard';
import { EmptySessions } from './EmptySessions';
import { sortSessionsByDate } from './SessionUtils';
import styles from './MySessionsSection.module.css';

const emptySubscribe = () => () => {};
const getClient = () => true;
const getServer = () => false;

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
        setResponses(sortSessionsByDate(res.data));
      } else {
        setResponses([]);
      }
    } catch {
      setError('Failed to load your sessions. Please try again.');
      toast.error('Failed to load your sessions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  useEffect(() => {
    const handleEvents = () => {
      if ((document.visibilityState === 'visible' || window.name === 'focus') && !isLoading) {
        loadResponses();
      }
    };

    document.addEventListener('visibilitychange', handleEvents);
    window.addEventListener('focus', handleEvents);

    return () => {
      document.removeEventListener('visibilitychange', handleEvents);
      window.removeEventListener('focus', handleEvents);
    };
  }, [loadResponses, isLoading]);

  const paginatedResponses = responses.slice((currentPage - 1) * PAGE_SIZE_5, currentPage * PAGE_SIZE_5);

  return (
    <section className={`${styles.section} ${className}`} aria-labelledby="my-sessions-heading">
      <Toaster position="top-center" richColors closeButton />
      <div className={styles.contentWrapper}>
        {isLoading ? (
          <div className={styles.center}>
            <LottieLoader width={160} height={160} centerPage />
          </div>
        ) : error ? (
          <div className={styles.center}>
            <p className={styles.errorText}>{error}</p>
            <button type="button" className={styles.btnRectangle} onClick={() => loadResponses()}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className={styles.sessionsGrid}>
              {responses.length === 0 && <EmptySessions />}
              {paginatedResponses.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  hasMounted={hasMounted}
                  isRequesting={false}
                  requestError={undefined}
                />
              ))}

              {responses.length > 0 && (
                <Link href="/drift-off/payment" className={styles.addSessionCard}>
                  <div className={styles.addIcon}>
                    <Icon icon={ICON_PLUS_CIRCLE} width={48} height={48} />
                  </div>
                  <h3 className={styles.addTitle}>Need another session?</h3>
                  <p className={styles.addText}>Every session is uniquely crafted for your current state.</p>
                  <div className={styles.btnRectangle}>Buy New Session</div>
                </Link>
              )}
            </div>

            <div className={styles.paginationWrapper}>
              <Pagination
                page={currentPage}
                limit={PAGE_SIZE_5}
                total={responses.length}
                totalPages={Math.max(1, Math.ceil(responses.length / PAGE_SIZE_5))}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
