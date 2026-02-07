'use client';

import Link from 'next/link';
import React from 'react';
import { FaHeartPulse, FaPills, FaClipboardList } from 'react-icons/fa6';
import styles from './QuickActions.module.css';

export function QuickActions() {
  return (
    <section className={styles.wrap} aria-label="Quick actions">
      <h2 className={styles.title}>Quick actions</h2>
      <div className={styles.grid}>
        <Link className={styles.action} href="/therapy-corner">
          <FaHeartPulse aria-hidden />
          Book a therapist
        </Link>
        <Link className={styles.action} href="/supplements">
          <FaPills aria-hidden />
          Browse supplements
        </Link>
        <Link className={styles.action} href="/sleep-assessment">
          <FaClipboardList aria-hidden />
          Take assessment
        </Link>
      </div>
    </section>
  );
}
