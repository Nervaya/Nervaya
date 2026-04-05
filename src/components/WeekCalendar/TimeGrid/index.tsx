'use client';

import React from 'react';
import { getHourLabels, HOUR_HEIGHT } from '../utils/calendarHelpers';
import styles from './styles.module.css';

export const TimeGrid: React.FC = () => {
  const hours = getHourLabels();

  return (
    <div className={styles.gutter}>
      <div className={styles.gutterHeader} />
      {hours.map((label) => (
        <div key={label} className={styles.hourRow} style={{ height: HOUR_HEIGHT }}>
          <span className={styles.hourLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
};
