'use client';

import { useEffect, useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
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
import { GlobalLoader } from '@/components/common/GlobalLoader';
import { StatTile } from '@/components/Dashboard/StatTile';
import { RecentActivity, type ActivityItem } from '@/components/Dashboard/RecentActivity';
import type { BreadcrumbItem } from '@/components/common';
import styles from './styles.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useCustomer } from '@/context/CustomerContext';
import { supplementsApi } from '@/lib/api/supplements';
import { ROUTES } from '@/utils/routesConstants';
import { ITEM_TYPE } from '@/lib/constants/enums';
import type { Supplement } from '@/types/supplement.types';
import {
  buildRecentActivity,
  getAssessmentTileModel,
  getNextSessionInfo,
} from '@/components/Dashboard/dashboardViewModel.util';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const {
    loading,
    error,
    sessions,
    orders,
    latestAssessment,
    inProgressAssessment,
    driftOffResponses,
    refreshData: retry,
  } = useCustomer();
  const [supplements, setSupplements] = useState<Supplement[]>([]);

  // We no longer use showLoader() here to keep it 'inside the page' and avoid double loaders

  useEffect(() => {
    const fetchSupps = async () => {
      try {
        const res = await supplementsApi.getAll();
        if (res.success) setSupplements(res.data || []);
      } catch {}
    };
    fetchSupps();
  }, []);

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

  const handleAddToCart = useCallback(
    (type: 'DriftOff' | 'Supplement') => {
      if (!isAuthenticated) {
        router.push(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent('/dashboard')}`);
        return;
      }

      if (type === 'DriftOff') {
        router.push(`/cart?addItemId=drift-off-session&itemType=${ITEM_TYPE.DRIFT_OFF}`);
      } else {
        const sleepElixir = supplements.find((s) => s.name.toLowerCase().includes('sleep elixir')) || supplements[0];

        if (!sleepElixir) {
          toast.error('Sleep Elixir not found');
          router.push('/supplements');
          return;
        }
        router.push(`/cart?addItemId=${sleepElixir._id}&itemType=${ITEM_TYPE.SUPPLEMENT}`);
      }
    },
    [isAuthenticated, router, supplements],
  );

  const welcomeName = user?.name?.trim() ? user.name : 'there';
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }];

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

        {loading ? (
          <GlobalLoader label="Loading your dashboard..." />
        ) : (
          <>
            <div className={styles.assessmentRow}>
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
            </div>

            <div className={styles.tilesGrid} aria-label="Module status tiles">
              <StatTile
                title="Therapy"
                value={
                  nextSession
                    ? `${nextSession.session.date} • ${nextSession.session.startTime}`
                    : 'No upcoming sessions'
                }
                subtitle={
                  nextSession
                    ? (() => {
                        const th = nextSession.session.therapistId;
                        const name =
                          typeof th === 'object' && th && 'name' in th ? (th as { name?: string }).name : null;
                        return `With ${name || 'Therapist'}`;
                      })()
                    : 'Book your next appointment anytime.'
                }
                icon={<Icon icon={ICON_CALENDAR} aria-hidden />}
                cta={[
                  { label: 'Book Session', href: '/therapy-corner', variant: 'primary' },
                  { label: 'Add to Cart', href: '/therapy-corner', variant: 'secondary' },
                ]}
                iconColor="var(--color-tile-indigo)"
              />

              <StatTile
                title="Deep Rest"
                value={
                  driftOffResponses.length > 0
                    ? `Purchased: ${driftOffResponses.length} session${driftOffResponses.length === 1 ? '' : 's'}`
                    : 'Tailored Audio'
                }
                subtitle={
                  driftOffResponses.length > 0
                    ? 'Your tailored audio is ready.'
                    : 'Listen to our curated deep rest sessions.'
                }
                icon={<Icon icon={ICON_MOON_SLEEP} aria-hidden />}
                cta={[
                  {
                    label: driftOffResponses.length > 0 ? 'Playlist' : 'Buy Audio',
                    href: driftOffResponses.length > 0 ? '/deep-rest/sessions' : '/deep-rest',
                    variant: 'primary',
                  },
                  {
                    label: 'Add to Cart',
                    href: '',
                    variant: 'secondary',
                    onClick: () => handleAddToCart('DriftOff'),
                  },
                ]}
                iconColor="var(--color-tile-violet)"
              />

              <StatTile
                title="Sleep Elixir"
                value="Supplements"
                subtitle="Fast-absorbing formula for deep, restorative sleep."
                icon={<Icon icon={ICON_SHOPPING_BAG} aria-hidden />}
                cta={[
                  { label: 'Buy Now', href: '/supplements', variant: 'primary' },
                  {
                    label: 'Add to Cart',
                    href: '',
                    variant: 'secondary',
                    onClick: () => handleAddToCart('Supplement'),
                  },
                ]}
                iconColor="var(--color-tile-rose)"
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
                <Link href="/therapy-corner" className={styles.inlineHint}>
                  Go to <span className={styles.accent}>Therapy Corner</span>{' '}
                  <Icon icon={ICON_CHEVRON_RIGHT} aria-hidden />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </Sidebar>
  );
}
