'use client';

import React from 'react';
import { Supplement } from '@/types/supplement.types';
import SupplementChip from '../SupplementChip';
import { useLoading } from '@/context/LoadingContext';
import styles from './SupplementChipList.module.css';

interface SupplementChipListProps {
  supplements: Supplement[];
  loading?: boolean;
}

const SupplementChipList: React.FC<SupplementChipListProps> = ({ supplements, loading = false }) => {
  const { showLoader, hideLoader } = useLoading();

  React.useEffect(() => {
    if (loading) {
      showLoader('Loading your picks...');
    } else {
      hideLoader();
    }
  }, [loading, showLoader, hideLoader]);
  if (loading) {
    return null;
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
