import Sidebar from '@/components/Sidebar/LazySidebar';
import MySessionsSection from '@/components/DriftOff/MySessionsSection';
import styles from './styles.module.css';

export default function DriftOffSessionsPage() {
  return (
    <Sidebar>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>My Deep Rest Sessions</h1>
            <p className={styles.subtitle}>View and manage your personalized Deep Rest Sessions</p>
          </header>

          <section className={styles.section} aria-labelledby="my-sessions-heading">
            <h2 id="my-sessions-heading" className={styles.sectionTitle}>
              Your Sessions
            </h2>
            <MySessionsSection />
          </section>
        </div>
      </div>
    </Sidebar>
  );
}
