'use client';

import Sidebar from '@/components/Sidebar/LazySidebar';
import containerStyles from '@/app/dashboard/styles.module.css'; // Reusing dashboard styles for consistency

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar>
      <div className={containerStyles.container}>{children}</div>
    </Sidebar>
  );
}
