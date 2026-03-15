'use client';

import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import {
  ICON_CLIPBOARD,
  ICON_CALENDAR,
  ICON_CHEVRON_RIGHT,
  ICON_BED,
  ICON_SHOPPING_BAG,
  ICON_MOON_SLEEP,
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
import type { BreadcrumbItem } from '@/components/common/Breadcrumbs';

export default function DashboardPage() {
  const { user } = useAuth();
  const { loading, error, sessions, orders, latestAssessment, inProgressAssessment, driftOffResponses, retry } =
    useDashboardData();

  const sessionCounts = useMemo(() => getSessionCounts(sessions), [sessions]);
  const nextSession = useMemo(() => getNextSessionInfo(sessions), [sessions]);

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

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }];

  if (loading) {
    return (
      <Sidebar hideGlobalBreadcrumbs>
        <div className={styles.container}>
          <PageHeader
            title={`Welcome back, ${welcomeName}!`}
            subtitle="Here's your personalized overview."
            breadcrumbs={breadcrumbs}
          />
          <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
            <LottieLoader width={200} height={200} />
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar hideGlobalBreadcrumbs>
      <div className={styles.container}>
        <PageHeader
          title={`Welcome back, ${welcomeName}!`}
          subtitle="Here's your personalized overview."
          breadcrumbs={breadcrumbs}
        />

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
            title="Therapy"
            value={
              nextSession
                ? `${nextSession.session.date} • ${nextSession.session.startTime}`
                : 'No upcoming therapy sessions'
            }
            subtitle={
              nextSession
                ? (() => {
                    const th = nextSession.session.therapistId;
                    const name = typeof th === 'object' && th && 'name' in th ? (th as { name?: string }).name : null;
                    return `With ${name || 'Therapist'}`;
                  })()
                : sessions.length > 0
                  ? `${sessionCounts.confirmed + sessionCounts.pending} upcoming • ${sessionCounts.completed} completed • ${sessionCounts.cancelled} cancelled`
                  : 'Book your next appointment anytime.'
            }
            icon={<Icon icon={ICON_CALENDAR} aria-hidden />}
            cta={{ label: 'Book a new session', href: '/therapy-corner' }}
            iconColor="var(--color-tile-indigo)"
          />

          <StatTile
            title="Sleep assessment"
            value={assessmentTile.value}
            subtitle={assessmentTile.subtitle}
            icon={<Icon icon={ICON_BED} aria-hidden />}
            cta={
              !assessmentTile.hideCta && assessmentTile.ctaLabel
                ? { label: assessmentTile.ctaLabel, href: '/sleep-assessment' }
                : undefined
            }
            iconColor="var(--color-tile-rose)"
          />

          <StatTile
            title="Drift-Off"
            value={
              driftOffResponses.length > 0
                ? `Purchased: ${driftOffResponses.length} session${driftOffResponses.length === 1 ? '' : 's'}`
                : 'Deep Rest'
            }
            subtitle={
              driftOffResponses.length > 0
                ? 'Your tailored audio is ready.'
                : 'Listen to our curated deep rest sessions.'
            }
            icon={<Icon icon={ICON_MOON_SLEEP} aria-hidden />}
            cta={{
              label: driftOffResponses.length > 0 ? 'Playlist made for you' : 'Listen now',
              href: driftOffResponses.length > 0 ? '/drift-off/sessions' : '/drift-off',
            }}
            iconColor="var(--color-tile-violet)"
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
              Go to <span className={styles.accent}>Therapy Corner</span> <Icon icon={ICON_CHEVRON_RIGHT} aria-hidden />
            </span>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
