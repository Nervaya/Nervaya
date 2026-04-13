'use client';

import { useState, useCallback, useMemo } from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import { Badge, DataTable, StatusState, type BreadcrumbItem, type ColumnDef } from '@/components/common';
import { GlobalLoader } from '@/components/common/GlobalLoader';
import Button from '@/components/common/Button';
import SessionFilters from '@/components/Admin/SessionFilters';
import { useAdminSessions } from '@/queries/sessions/useSessions';
import type { SessionFiltersParams } from '@/lib/api/sessions';
import { PAGE_SIZE_10 } from '@/lib/constants/pagination.constants';
import type { Therapist } from '@/types/therapist.types';
import type { Session, SessionUserSummary } from '@/types/session.types';

function countActiveFilters(f: SessionFiltersParams): number {
  let n = 0;
  if (f.status) n++;
  if (f.therapistId) n++;
  if (f.dateFrom) n++;
  if (f.dateTo) n++;
  if (f.search?.trim()) n++;
  return n;
}

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

function statusVariant(status: string): StatusVariant {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    case 'confirmed':
      return 'info';
    default:
      return 'neutral';
  }
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

  const columns = useMemo<ColumnDef<Session>[]>(
    () => [
      {
        key: 'therapist',
        header: 'Therapist',
        sortable: true,
        sortAccessor: (session) => (session.therapistId as unknown as Therapist)?.name ?? '',
        cell: (session) => {
          const therapist = session.therapistId as unknown as Therapist;
          return therapist?.name ?? 'Unknown Therapist';
        },
      },
      {
        key: 'user',
        header: 'User',
        sortable: true,
        sortAccessor: (session) => {
          const userRef = session.userId;
          const user = typeof userRef === 'object' && userRef !== null ? (userRef as SessionUserSummary) : null;
          return user?.name ?? '';
        },
        cell: (session) => {
          const userRef = session.userId;
          const user = typeof userRef === 'object' && userRef !== null ? (userRef as SessionUserSummary) : null;
          const userName = user?.name ?? 'Unknown user';
          return (
            <div>
              <div>{userName}</div>
              {user?.email && <div style={{ color: 'var(--color-text-secondary)' }}>{user.email}</div>}
            </div>
          );
        },
        hideOn: 'sm',
      },
      {
        key: 'date',
        header: 'Date',
        sortable: true,
        sortAccessor: (session) => new Date(session.date).getTime(),
        cell: (session) => new Date(session.date).toLocaleDateString(),
        width: '140px',
      },
      {
        key: 'time',
        header: 'Time',
        cell: (session) => `${session.startTime} – ${session.endTime}`,
        width: '180px',
        hideOn: 'md',
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        sortAccessor: (session) => session.status,
        cell: (session) => (
          <Badge variant={statusVariant(session.status)} shape="pill" size="sm">
            {session.status}
          </Badge>
        ),
        align: 'right',
        width: '120px',
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Sessions" subtitle="View all sessions (read-only)." breadcrumbs={breadcrumbs} />
        <GlobalLoader label="Loading sessions..." />
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
            <Button type="button" variant="primary" size="md" fullWidth={false} onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
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
      <DataTable<Session>
        columns={columns}
        data={sessions ?? []}
        rowKey={(session) => session._id}
        title="Sessions"
        countLabel={(t) => `${t} Session${t === 1 ? '' : 's'}`}
        total={paginationMeta.total}
        emptyMessage="No sessions found."
        ariaLabel="Sessions"
        pagination={{
          page: paginationMeta.page,
          limit: paginationMeta.limit,
          total: paginationMeta.total,
          totalPages: paginationMeta.totalPages,
          onPageChange: setPage,
          ariaLabel: 'Sessions pagination',
        }}
      />
    </div>
  );
}
