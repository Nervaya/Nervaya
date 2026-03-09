'use client';

import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import {
  ICON_CLIPBOARD,
  ICON_CALENDAR,
  ICON_HEART_PULSE,
  ICON_ARROW_RIGHT,
  ICON_BED,
  ICON_SHOPPING_BAG,
} from '@/constants/icons';
import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import { StatTile } from '@/components/Dashboard/StatTile';
import { RecentActivity, type ActivityItem } from '@/components/Dashboard/RecentActivity';
import LottieLoader from '@/components/common/LottieLoader';
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
          <Icon icon={ICON_CALENDAR} aria-hidden />
        ) : it.iconKey === 'order' ? (
          <Icon icon={ICON_SHOPPING_BAG} aria-hidden />
        ) : (
          <Icon icon={ICON_CLIPBOARD} aria-hidden />
        ),
    }));
  }, [recentActivity]);

  const welcomeName = user?.name?.trim() ? user.name : 'there';

  if (loading) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <PageHeader title={`Welcome back, ${welcomeName}!`} subtitle="Here's your personalized overview." />
          <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
            <LottieLoader width={200} height={200} />
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className={styles.container}>
        <section className={styles.welcomeHero}>
          <PageHeader title={`Welcome back, ${welcomeName}!`} subtitle="Here's your personalized overview." />
        </section>

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
              nextSession ? `${nextSession.session.date} • ${nextSession.session.startTime}` : 'No upcoming sessions'
            }
            subtitle={
              nextSession
                ? (() => {
                    const th = nextSession.session.therapistId;
                    const name = typeof th === 'object' && th && 'name' in th ? (th as { name?: string }).name : null;
                    return `With ${name || 'Therapist'}`;
                  })()
                : 'Book your next appointment anytime.'
            }
            icon={<Icon icon={ICON_CALENDAR} aria-hidden />}
            cta={{ label: 'Book session', href: '/therapy-corner' }}
            themeColor="var(--color-tile-indigo)"
          />

          <StatTile
            title="Sessions summary"
            value={`${sessionCounts.completed} completed`}
            subtitle={`${sessionCounts.pending} pending • ${sessionCounts.confirmed} confirmed • ${sessionCounts.cancelled} cancelled`}
            icon={<Icon icon={ICON_HEART_PULSE} aria-hidden />}
            cta={{ label: 'Book therapist', href: '/therapy-corner' }}
            themeColor="var(--color-tile-violet)"
          />

          <StatTile
            title="Orders"
            value={`${orders.length}`}
            subtitle={
              latestOrder
                ? `Latest: ${latestOrder.orderStatus} • ₹${Math.round(latestOrder.totalAmount)}`
                : "No orders yet — browse supplements when you're ready."
            }
            icon={<Icon icon={ICON_SHOPPING_BAG} aria-hidden />}
            cta={{ label: 'My orders', href: '/account' }}
            themeColor="var(--color-tile-emerald)"
          />

          <StatTile
            title="Sleep assessment"
            value={assessmentTile.value}
            subtitle={assessmentTile.subtitle}
            icon={<Icon icon={ICON_BED} aria-hidden />}
            cta={{ label: assessmentTile.ctaLabel, href: '/sleep-assessment' }}
            themeColor="var(--color-tile-rose)"
          />
        </div>

        <div className={styles.recentActivitySection}>
          <RecentActivity items={activityItems} />
        </div>

        {!error && sessions.length === 0 && orders.length === 0 && (
          <div className={styles.emptyNote}>
            <p>
              Explore what Nervaya offers. <span className={styles.muted}>Your activity will show up here.</span>
            </p>
            <span className={styles.inlineHint}>
              Go to <span className={styles.accent}>Therapy Corner</span> <Icon icon={ICON_ARROW_RIGHT} aria-hidden />
            </span>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
