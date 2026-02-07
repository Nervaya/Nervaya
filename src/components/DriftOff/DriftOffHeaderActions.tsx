'use client';

import Link from 'next/link';
import styles from './styles.module.css';

const DriftOffHeaderActions = () => {
  return (
    <div className={styles.headerActions}>
      <Link href="#" className={styles.buttonPrimary}>
        Buy Custom Session &gt;
      </Link>
      <Link href="#" className={styles.buttonSecondary}>
        Know More &gt;
      </Link>
    </div>
  );
};

export default DriftOffHeaderActions;
