import PageHeader from '@/components/PageHeader/PageHeader';
import styles from './styles.module.css';

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Welcome, Admin! Use the sidebar to manage therapists and slots." />
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Therapists</h3>
          <p>Manage list of available therapists and their schedules.</p>
        </div>
      </div>
    </div>
  );
}
