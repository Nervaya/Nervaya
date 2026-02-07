'use client';

import { FaBoxOpen, FaCalendarCheck, FaPills, FaUsers, FaIndianRupeeSign } from 'react-icons/fa6';
import PageHeader from '@/components/PageHeader/PageHeader';
import LottieLoader from '@/components/common/LottieLoader';
import StatusState from '@/components/common/StatusState';
import StatsCard from '@/components/Admin/StatsCard';
import RecentOrders from '@/components/Admin/RecentOrders';
import UpcomingSessions from '@/components/Admin/UpcomingSessions';
import LowStockAlerts from '@/components/Admin/LowStockAlerts';
import { useAdminStats } from '@/app/queries/admin/useAdminStats';
import { formatPrice } from '@/utils/cart.util';
import styles from './styles.module.css';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error, refetch } = useAdminStats();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Admin Dashboard" subtitle="Overview of orders, sessions, and inventory." />
        <div className={styles.loaderWrapper}>
          <LottieLoader width={200} height={200} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Admin Dashboard" subtitle="Overview of orders, sessions, and inventory." />
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

  if (!stats) {
    return (
      <div>
        <PageHeader title="Admin Dashboard" subtitle="Overview of orders, sessions, and inventory." />
        <StatusState type="empty" message="Unable to load dashboard stats." />
      </div>
    );
  }

  const { orders, sessions, supplements, users, revenue } = stats;

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Overview of orders, sessions, and inventory." />

      <section className={styles.statsGrid} aria-label="Key metrics">
        <StatsCard
          title="Total Orders"
          value={orders.total}
          subtitle={`Pending: ${orders.byStatus?.pending ?? 0} · Confirmed: ${orders.byStatus?.confirmed ?? 0}`}
          icon={<FaBoxOpen />}
        />
        <StatsCard
          title="Total Revenue"
          value={formatPrice(revenue.total)}
          subtitle={`This month: ${formatPrice(revenue.thisMonth)}`}
          icon={<FaIndianRupeeSign />}
          trend={revenue.growthPercent >= 0 ? 'up' : 'down'}
          trendLabel={
            revenue.growthPercent >= 0
              ? `+${revenue.growthPercent}% vs last month`
              : `${revenue.growthPercent}% vs last month`
          }
        />
        <StatsCard
          title="Sessions"
          value={sessions.total}
          subtitle={`Upcoming: ${sessions.upcomingCount} · Completed: ${sessions.completedCount}`}
          icon={<FaCalendarCheck />}
        />
        <StatsCard
          title="Supplements"
          value={supplements.total}
          subtitle={`Active: ${supplements.activeCount} · Low stock: ${supplements.lowStockCount}`}
          icon={<FaPills />}
        />
        <StatsCard
          title="Users"
          value={users.total}
          subtitle={`Customers: ${users.customers} · Admins: ${users.admins}`}
          icon={<FaUsers />}
        />
      </section>

      <div className={styles.twoCol}>
        <section className={styles.section} aria-labelledby="recent-orders-heading">
          <h2 id="recent-orders-heading" className={styles.sectionTitle}>
            Recent Orders
          </h2>
          <div className={styles.sectionCard}>
            <RecentOrders orders={orders.recentOrders ?? []} />
          </div>
        </section>
        <section className={styles.section} aria-labelledby="upcoming-sessions-heading">
          <h2 id="upcoming-sessions-heading" className={styles.sectionTitle}>
            Upcoming Sessions
          </h2>
          <div className={styles.sectionCard}>
            <UpcomingSessions sessions={sessions.upcomingSessions ?? []} />
          </div>
        </section>
      </div>

      <section className={styles.section} aria-labelledby="low-stock-heading">
        <h2 id="low-stock-heading" className={styles.sectionTitle}>
          Low Stock Alerts
          {supplements.lowStockCount > 0 && <span className={styles.alertBadge}> {supplements.lowStockCount}</span>}
        </h2>
        <div className={styles.sectionCard}>
          <LowStockAlerts items={supplements.lowStockItems ?? []} />
        </div>
      </section>
    </div>
  );
}
