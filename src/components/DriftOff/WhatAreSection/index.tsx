'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import styles from './styles.module.css';

const WhatAreSection = () => {
  return (
    <div className={styles.whatAreCard}>
      <div className={styles.whatAreIcon} aria-hidden>
        <Icon icon="solar:headphones-round-bold-duotone" />
      </div>
      <div className={styles.whatAreContent}>
        <p className={styles.whatAreText}>
          Deep Rest Sessions are 25-minute personalized audio experiences designed for anyone who struggles to unwind or
          fall asleep. They blend gentle hypnotic guidance with neuroplasticity-backed techniques to help your mind and
          body transition into deep, restorative rest.
        </p>
      </div>
      <div className={styles.whatAreAction}>
        <Link href="/drift-off/payment" className={styles.buttonPrimary}>
          Buy Session
        </Link>
      </div>
    </div>
  );
};

export default WhatAreSection;
