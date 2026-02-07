'use client';

import React from 'react';
import { Supplement } from '@/types/supplement.types';
import SupplementChip from '../SupplementChip';
import LottieLoader from '@/components/common/LottieLoader';
import styles from './SupplementChipList.module.css';

interface SupplementChipListProps {
  supplements: Supplement[];
  loading?: boolean;
}

const SupplementChipList: React.FC<SupplementChipListProps> = ({ supplements, loading = false }) => {
  if (loading) {
    return (
      <div className={styles.loading}>
        <LottieLoader width={200} height={200} />
      </div>
    );
  }

  if (supplements.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No supplements available</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ul className={styles.chipList} aria-label="Supplement picks">
        {supplements.map((supplement) => (
          <li key={supplement._id}>
            <SupplementChip supplement={supplement} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupplementChipList;
