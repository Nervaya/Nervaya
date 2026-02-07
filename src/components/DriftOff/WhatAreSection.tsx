'use client';

import Link from 'next/link';
import { FaHeadphones } from 'react-icons/fa';
import styles from './styles.module.css';

const WhatAreSection = () => {
  return (
    <div className={styles.whatAreCard}>
      <div className={styles.whatAreIcon} aria-hidden>
        <FaHeadphones />
      </div>
      <div className={styles.whatAreContent}>
        <p className={styles.whatAreText}>
          Deep Rest Sessions are 25-minute personalized audio experiences designed for anyone who struggles to unwind or
          fall asleep. They blend gentle hypnotic guidance with neuroplasticity-backed techniques to help your mind and
          body transition into deep, restorative rest.
        </p>
        <div className={styles.heroButtons}>
          <Link href="#" className={styles.buttonPrimary}>
            Buy Custom Session &gt;
          </Link>
          <Link href="#" className={styles.buttonSecondary}>
            Know More &gt;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WhatAreSection;
