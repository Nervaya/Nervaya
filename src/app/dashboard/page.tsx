'use client';

import { useMemo } from 'react';
import { FaClipboardList, FaCalendarCheck, FaHeartPulse, FaArrowRight, FaBed } from 'react-icons/fa6';
import { FaShoppingBag } from 'react-icons/fa';
import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import { StatTile } from '@/components/Dashboard/StatTile';
import { RecentActivity, type ActivityItem } from '@/components/Dashboard/RecentActivity';
import styles from './styles.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/components/Dashboard/useDashboardData';
import {
  buildRecentActivity,
  getAssessmentTileModel,
  getNextSessionInfo,
  getSessionCounts,
} from '@/components/Dashboard/dashboardViewModel.util';

export default function DashboardPage() {
  const { user } = useAuth();
  const { loading, error, sessions, orders, latestAssessment, inProgressAssessment, retry } = useDashboardData();

  const sessionCounts = useMemo(() => getSessionCounts(sessions), [sessions]);
  const nextSession = useMemo(() => getNextSessionInfo(sessions), [sessions]);
  const latestOrder = useMemo(() => (orders.length > 0 ? orders[0] : null), [orders]);
  const assessmentTile = useMemo(
    () => getAssessmentTileModel(latestAssessment, inProgressAssessment),
    [latestAssessment, inProgressAssessment],
  );
  const recentActivity = useMemo(
    () => buildRecentActivity(sessions, orders, latestAssessment, 5),
    [sessions, orders, latestAssessment],
  );

  const activityItems: ActivityItem[] = useMemo(() => {
    return recentActivity.map((it) => ({
      id: it.id,
      label: it.label,
      timeLabel: it.timeLabel,
      icon:
        it.iconKey === 'session' ? (
          <FaCalendarCheck aria-hidden />
        ) : it.iconKey === 'order' ? (
          <FaShoppingBag aria-hidden />
        ) : (
          <FaClipboardList aria-hidden />
        ),
    }));
  }, [recentActivity]);

  const welcomeName = user?.name?.trim() ? user.name : 'there';

  return (
    <Sidebar>
      <div className={styles.container}>
        <PageHeader title={`Welcome back, ${welcomeName}!`} subtitle="Here’s your personalized overview." />

        {error && (
          <div className={styles.errorRow} role="alert">
            <span>{error}</span>
            <button type="button" className={styles.retryBtn} onClick={retry}>
              Retry
            </button>
          </div>
        )}

        <div className={styles.tilesGrid} aria-label="Dashboard summary tiles">
          <StatTile
            title="Upcoming session"
            value={
              loading
                ? '—'
                : nextSession
                  ? `${nextSession.session.date} • ${nextSession.session.startTime}`
                  : 'No upcoming sessions'
            }
            subtitle={
              loading
                ? 'Loading…'
                : nextSession
                  ? (() => {
                      const th = nextSession.session.therapistId;
                      const name = typeof th === 'object' && th && 'name' in th ? (th as { name?: string }).name : null;
                      return `With ${name || 'Therapist'}`;
                    })()
                  : 'Book your next appointment anytime.'
            }
            icon={<FaCalendarCheck aria-hidden />}
            cta={{ label: 'My sessions', href: '/account' }}
          />

          <StatTile
            title="Sessions summary"
            value={loading ? '—' : `${sessionCounts.completed} completed`}
            subtitle={
              loading
                ? 'Loading…'
                : `${sessionCounts.pending} pending • ${sessionCounts.confirmed} confirmed • ${sessionCounts.cancelled} cancelled`
            }
            icon={<FaHeartPulse aria-hidden />}
            cta={{ label: 'Book therapist', href: '/therapy-corner' }}
          />

          <StatTile
            title="Orders"
            value={loading ? '—' : `${orders.length}`}
            subtitle={
              loading
                ? 'Loading…'
                : latestOrder
                  ? `Latest: ${latestOrder.orderStatus} • ₹${Math.round(latestOrder.totalAmount)}`
                  : 'No orders yet — browse supplements when you’re ready.'
            }
            icon={<FaShoppingBag aria-hidden />}
            cta={{ label: 'My orders', href: '/account' }}
          />

          <StatTile
            title="Sleep assessment"
            value={loading ? '—' : assessmentTile.value}
            subtitle={loading ? 'Loading…' : assessmentTile.subtitle}
            icon={<FaBed aria-hidden />}
            cta={{ label: assessmentTile.ctaLabel, href: '/sleep-assessment' }}
          />
        </div>

        <div className={styles.recentActivitySection}>
          <RecentActivity items={loading ? [] : activityItems} />
        </div>

        {!loading && !error && sessions.length === 0 && orders.length === 0 && (
          <div className={styles.emptyNote}>
            <p>
              Explore what Nervaya offers. <span className={styles.muted}>Your activity will show up here.</span>
            </p>
            <span className={styles.inlineHint}>
              Go to <span className={styles.accent}>Therapy Corner</span> <FaArrowRight aria-hidden />
            </span>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
