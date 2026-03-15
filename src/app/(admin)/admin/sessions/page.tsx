'use client';

import { useState, useCallback } from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import Pagination from '@/components/common/Pagination';
import LottieLoader from '@/components/common/LottieLoader';
import StatusState from '@/components/common/StatusState';
import SessionFilters from '@/components/Admin/SessionFilters';
import { useAdminSessions } from '@/queries/sessions/useSessions';
import type { SessionFiltersParams } from '@/lib/api/sessions';
import { PAGE_SIZE_10 } from '@/lib/constants/pagination.constants';
import type { Therapist } from '@/types/therapist.types';
import styles from './styles.module.css';
import type { BreadcrumbItem } from '@/components/common/Breadcrumbs';

function countActiveFilters(f: SessionFiltersParams): number {
  let n = 0;
  if (f.status) n++;
  if (f.therapistId) n++;
  if (f.dateFrom) n++;
  if (f.dateTo) n++;
  if (f.userId?.trim()) n++;
  return n;
}

export default function AdminSessionsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SessionFiltersParams>({});
  const limit = PAGE_SIZE_10;
  const { data: sessions, meta, isLoading, error, refetch } = useAdminSessions(page, limit, filters);
  const paginationMeta = meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Sessions' }];

  const handleFiltersApply = useCallback((newFilters: SessionFiltersParams) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Sessions" subtitle="View all sessions (read-only)." breadcrumbs={breadcrumbs} />
        <SessionFilters
          initialFilters={filters}
          onApply={handleFiltersApply}
          onReset={handleFiltersReset}
          activeCount={countActiveFilters(filters)}
        />
        <div className={styles.loaderWrapper}>
          <LottieLoader width={200} height={200} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Sessions" subtitle="View all sessions (read-only)." breadcrumbs={breadcrumbs} />
        <SessionFilters
          initialFilters={filters}
          onApply={handleFiltersApply}
          onReset={handleFiltersReset}
          activeCount={countActiveFilters(filters)}
        />
        <StatusState
          type="error"
          message={error}
          action={
            <button type="button" onClick={() => refetch()} className={styles.retryButton}>
              Retry
            </button>
          }
        />
      </div>
    );
  }

  if (!sessions?.length) {
    return (
      <div>
        <PageHeader title="Sessions" subtitle="View all sessions (read-only)." breadcrumbs={breadcrumbs} />
        <SessionFilters
          initialFilters={filters}
          onApply={handleFiltersApply}
          onReset={handleFiltersReset}
          activeCount={countActiveFilters(filters)}
        />
        <StatusState type="empty" message="No sessions found." />
        <div className={styles.paginationWrap}>
          <Pagination
            page={paginationMeta.page}
            limit={paginationMeta.limit}
            total={paginationMeta.total}
            totalPages={paginationMeta.totalPages}
            onPageChange={setPage}
            ariaLabel="Sessions pagination"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Sessions" subtitle="View all sessions (read-only)." breadcrumbs={breadcrumbs} />
      <SessionFilters
        initialFilters={filters}
        onApply={handleFiltersApply}
        onReset={handleFiltersReset}
        activeCount={countActiveFilters(filters)}
      />
      <ul className={styles.list} aria-label="All sessions">
        {sessions.map((session) => {
          const therapist = session.therapistId as unknown as Therapist;
          return (
            <li key={session._id} className={styles.card}>
              <div className={styles.sessionHeader}>
                <div>
                  <h3 className={styles.therapistName}>{therapist?.name ?? 'Unknown Therapist'}</h3>
                  <p className={styles.userId}>User ID: {session.userId}</p>
                </div>
                <span
                  className={`${styles.statusBadge} ${styles[`status${session.status.charAt(0).toUpperCase()}${session.status.slice(1)}`] ?? ''}`}
                >
                  {session.status}
                </span>
              </div>
              <div className={styles.sessionDetails}>
                <p>Date: {new Date(session.date).toLocaleDateString()}</p>
                <p>
                  Time: {session.startTime} – {session.endTime}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      {meta && (
        <div className={styles.paginationWrap}>
          <Pagination
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            totalPages={meta.totalPages}
            onPageChange={setPage}
            ariaLabel="Sessions pagination"
          />
        </div>
      )}
    </div>
  );
}
