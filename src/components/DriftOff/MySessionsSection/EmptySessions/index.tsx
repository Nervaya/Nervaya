'use client';

import React from 'react';
import Link from 'next/link';

import styles from './EmptySessions.module.css';

export const EmptySessions: React.FC = () => {
  return (
    <div className={styles.noSessionsMessage}>
      <h3 className={styles.noSessionsTitle}>Start Your Journey</h3>
      <p className={styles.noSessionsText}>
        Experience a personalized Deep Rest session designed just for you. Once you purchase a session, it will appear
        here.
      </p>
      <Link href="/drift-off/payment" className={styles.btn}>
        Buy Your First Session
      </Link>
    </div>
  );
};
