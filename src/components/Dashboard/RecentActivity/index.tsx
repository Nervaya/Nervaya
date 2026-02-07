'use client';

import React from 'react';
import styles from './RecentActivity.module.css';

export interface ActivityItem {
  id: string;
  label: string;
  timeLabel: string;
  icon?: React.ReactNode;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <section className={styles.wrap} aria-label="Recent activity">
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Recent activity</h2>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>No recent activity yet.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((it) => (
            <li key={it.id} className={styles.item}>
              <span className={styles.left}>
                {it.icon && (
                  <span className={styles.icon} aria-hidden>
                    {it.icon}
                  </span>
                )}
                <span className={styles.label}>{it.label}</span>
              </span>
              <span className={styles.time}>{it.timeLabel}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
