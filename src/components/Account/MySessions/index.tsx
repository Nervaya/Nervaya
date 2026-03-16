'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { sessionsApi } from '@/lib/api/sessions';
import { Session } from '@/types/session.types';
import { Pagination, LottieLoader } from '@/components/common';
import { PAGE_SIZE_3 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';
import { Icon } from '@iconify/react';
import { ICON_CALENDAR } from '@/constants/icons';

// Sub-components
import TherapySessionCard from './TherapySessionCard';
import SessionDetailModal from './SessionDetailModal';

export function MySessions() {
  const [therapySessions, setTherapySessions] = useState<Session[]>([]);
  const [loadingTherapy, setLoadingTherapy] = useState(true);
  const [errorTherapy, setErrorTherapy] = useState('');
  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);

  const limit = PAGE_SIZE_3;

  // Therapy Logic
  const totalTherapy = therapySessions.length;
  const totalPagesTherapy = Math.max(1, Math.ceil(totalTherapy / limit));
  const paginatedTherapy = useMemo(
    () => therapySessions.slice((page - 1) * limit, page * limit),
    [therapySessions, page, limit],
  );

  useEffect(() => {
    setMounted(true);
    fetchTherapySessions();
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

  const calculateDuration = (_startTime: string, _endTime: string) => {
    return '60 minutes';
  };

  if (loadingTherapy) {
    return (
      <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
        <LottieLoader width={200} height={200} centerPage />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Sessions</h2>
      <p className={styles.subheading}>Manage your therapy sessions</p>

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
            {paginatedTherapy.map((session) => (
              <TherapySessionCard key={session._id} session={session} onViewDetails={setSelectedSession} />
            ))}
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

      {mounted &&
        selectedSession &&
        createPortal(
          <SessionDetailModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            calculateDuration={calculateDuration}
          />,
          document.body,
        )}
    </div>
  );
}
