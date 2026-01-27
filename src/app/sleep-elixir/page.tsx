'use client';

import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import styles from '@/app/dashboard/styles.module.css'; // Reusing dashboard styles for consistency

export default function SleepElixirPage() {
  return (
    <Sidebar>
      <div className={styles.container}>
        <PageHeader
          title="Sleep Elixir"
          subtitle="Discover our natural sleep aids and supplements. Launching shortly."
        />
      </div>
    </Sidebar>
  );
}
