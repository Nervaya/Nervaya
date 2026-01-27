"use client";

import PageHeader from "@/components/PageHeader/PageHeader";
import Sidebar from "@/components/Sidebar/LazySidebar";
import styles from "@/app/dashboard/styles.module.css"; // Reusing dashboard styles for consistency

export default function DriftOffPage() {
  return (
    <Sidebar>
      <div className={styles.container}>
        <PageHeader
          title="Deep Rest Sessions"
          subtitle="Curated audio sessions to help you drift off are coming soon."
        />
      </div>
    </Sidebar>
  );
}
