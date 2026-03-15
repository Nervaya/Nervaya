import Sidebar from '@/components/Sidebar/LazySidebar';
import MySessionsSection from '@/components/DriftOff/MySessionsSection';
import PageHeader from '@/components/PageHeader/PageHeader';
import type { BreadcrumbItem } from '@/components/common/Breadcrumbs';
import styles from './styles.module.css';

export default function DriftOffSessionsPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Drift Off', href: '/drift-off' },
    { label: 'My Sessions' },
  ];

  return (
    <Sidebar hideGlobalBreadcrumbs>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <PageHeader
            title="My Deep Rest Sessions"
            subtitle="View and manage your personalized Deep Rest Sessions"
            breadcrumbs={breadcrumbs}
          />

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
