'use client';

import { useState, useCallback } from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import { Pagination, StatusState, type BreadcrumbItem } from '@/components/common';
import { GlobalLoader } from '@/components/common/GlobalLoader';
import FeedbackFilters from '@/components/Admin/FeedbackFilters';
import { useAdminFeedback } from '@/queries/feedback/useAdminFeedback';
import type { AdminFeedback, AdminFeedbackFiltersParams } from '@/lib/api/adminFeedback';
import { PAGE_SIZE_10 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';

function countActiveFilters(f: AdminFeedbackFiltersParams): number {
  let n = 0;
  if (f.minScore != null && !Number.isNaN(f.minScore)) n++;
  if (f.maxScore != null && !Number.isNaN(f.maxScore)) n++;
  if (f.dateFrom) n++;
  if (f.dateTo) n++;
  return n;
}

function getScoreClass(score: number): string {
  if (score <= 6) return styles.detractor;
  if (score <= 8) return styles.passive;
  return styles.promoter;
}

function getUserName(feedback: AdminFeedback): string {
  if (typeof feedback.userId === 'object' && feedback.userId !== null) {
    return feedback.userId.name || 'Unknown User';
  }
  return String(feedback.userId);
}

function getUserEmail(feedback: AdminFeedback): string {
  if (typeof feedback.userId === 'object' && feedback.userId !== null) {
    return feedback.userId.email || '';
  }
  return '';
}

export default function AdminFeedbackPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdminFeedbackFiltersParams>({});
  const limit = PAGE_SIZE_10;
  const { data: feedback, meta, isLoading, error, refetch } = useAdminFeedback(page, limit, filters);
  const paginationMeta = meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Feedback' }];

  const handleFiltersApply = useCallback((newFilters: AdminFeedbackFiltersParams) => {
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
        <PageHeader title="Feedback" subtitle="View all user feedback (read-only)." breadcrumbs={breadcrumbs} />
        <GlobalLoader label="Loading feedback..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Feedback" subtitle="View all user feedback (read-only)." breadcrumbs={breadcrumbs} />
        <FeedbackFilters
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

  if (!feedback?.length) {
    return (
      <div>
        <PageHeader title="Feedback" subtitle="View all user feedback (read-only)." breadcrumbs={breadcrumbs} />
        <FeedbackFilters
          initialFilters={filters}
          onApply={handleFiltersApply}
          onReset={handleFiltersReset}
          activeCount={countActiveFilters(filters)}
        />
        <StatusState type="empty" message="No feedback found." />
        <div className={styles.paginationWrap}>
          <Pagination
            page={paginationMeta.page}
            limit={paginationMeta.limit}
            total={paginationMeta.total}
            totalPages={paginationMeta.totalPages}
            onPageChange={setPage}
            ariaLabel="Feedback pagination"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Feedback" subtitle="View all user feedback (read-only)." breadcrumbs={breadcrumbs} />
      <FeedbackFilters
        initialFilters={filters}
        onApply={handleFiltersApply}
        onReset={handleFiltersReset}
        activeCount={countActiveFilters(filters)}
      />
      <ul className={styles.list} aria-label="All feedback">
        {feedback.map((item) => (
          <li key={item._id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.userName}>{getUserName(item)}</h3>
                {getUserEmail(item) && <p className={styles.userEmail}>{getUserEmail(item)}</p>}
              </div>
              <span className={`${styles.scoreBadge} ${getScoreClass(item.score)}`}>{item.score}</span>
            </div>
            {item.comment && <p className={styles.comment}>{item.comment}</p>}
            <div className={styles.cardFooter}>
              {item.pageUrl && <span className={styles.pageUrlChip}>{item.pageUrl}</span>}
              <p className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
      </ul>
      {meta && (
        <div className={styles.paginationWrap}>
          <Pagination
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            totalPages={meta.totalPages}
            onPageChange={setPage}
            ariaLabel="Feedback pagination"
          />
        </div>
      )}
    </div>
  );
}
