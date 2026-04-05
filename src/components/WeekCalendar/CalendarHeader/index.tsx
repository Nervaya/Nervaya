'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import styles from './styles.module.css';

interface CalendarHeaderProps {
  weekLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  therapistName?: string;
  onBack?: () => void;
}

const LEGEND = [
  { color: '#10b981', label: 'Available' },
  { color: '#f59e0b', label: 'Pending' },
  { color: '#7c3aed', label: 'Confirmed' },
  { color: '#94a3b8', label: 'Completed' },
  { color: '#ef4444', label: 'Blocked' },
];

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  weekLabel,
  onPrev,
  onNext,
  onToday,
  onToggleSidebar,
  therapistName,
  onBack,
}) => {
  return (
    <div className={styles.header}>
      {/* Left: nav + title */}
      <div className={styles.leftGroup}>
        {onBack && (
          <button type="button" className={styles.backBtn} onClick={onBack}>
            <Icon icon="solar:alt-arrow-left-linear" width={16} height={16} />
          </button>
        )}
        {onToggleSidebar && (
          <button type="button" className={styles.iconBtn} onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <Icon icon="solar:hamburger-menu-linear" width={18} height={18} />
          </button>
        )}
        <div className={styles.navArrows}>
          <button type="button" className={styles.arrowBtn} onClick={onPrev} aria-label="Previous week">
            <Icon icon="solar:alt-arrow-left-linear" width={18} height={18} />
          </button>
          <button type="button" className={styles.arrowBtn} onClick={onNext} aria-label="Next week">
            <Icon icon="solar:alt-arrow-right-linear" width={18} height={18} />
          </button>
        </div>
        <h2 className={styles.title}>{weekLabel}</h2>
        {therapistName && (
          <span className={styles.therapistChip}>
            <Icon icon="solar:user-circle-bold" width={14} height={14} />
            {therapistName}
          </span>
        )}
      </div>

      {/* Right: legend + today + badge */}
      <div className={styles.rightGroup}>
        <div className={styles.legend}>
          {LEGEND.map((item) => (
            <span key={item.label} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
        <button type="button" className={styles.todayBtn} onClick={onToday}>
          Today
        </button>
        <span className={styles.viewBadge}>Week</span>
      </div>
    </div>
  );
};
