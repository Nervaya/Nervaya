"use client";

import Sidebar from "@/components/Sidebar/LazySidebar";
import styles from "./styles.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Sidebar>
      <div className={styles.container}>{children}</div>
    </Sidebar>
  );
}
