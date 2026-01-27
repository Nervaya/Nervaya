import { FaBed, FaHeartPulse, FaCalendarCheck } from 'react-icons/fa6';
import Sidebar from '@/components/Sidebar/LazySidebar';
import styles from './styles.module.css';

export default function DashboardPage() {
  return (
    <Sidebar>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Welcome back, Test User!</h1>
          <p className={styles.subtitle}>
            Here is an overview of your sleep journey.
          </p>
        </header>

        <div className={styles.statsGrid}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <FaBed />
            </div>
            <h3 className={styles.cardTitle}>Sleep Score</h3>
            <p className={styles.cardValue}>85/100</p>
            <p className={styles.cardHint}>+5 points from last week</p>
          </div>

          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <FaHeartPulse />
            </div>
            <h3 className={styles.cardTitle}>Sessions Completed</h3>
            <p className={styles.cardValue}>12</p>
            <p className={styles.cardHint}>Keep it up!</p>
          </div>

          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <FaCalendarCheck />
            </div>
            <h3 className={styles.cardTitle}>Next Session</h3>
            <p className={styles.cardValue}>Today, 8 PM</p>
            <p className={styles.cardHint}>Deep Rest Session</p>
          </div>
        </div>

        <section className={styles.recentActivity}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <span>Completed &quot;Intro to Sleep&quot;</span>
              <span className={styles.time}>2 hours ago</span>
            </div>
            <div className={styles.activityItem}>
              <span>Booked Therapy Session</span>
              <span className={styles.time}>Yesterday</span>
            </div>
          </div>
        </section>
      </div>
    </Sidebar>
  );
}
