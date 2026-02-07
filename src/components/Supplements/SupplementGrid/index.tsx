'use client';

import React from 'react';
import { Supplement } from '@/types/supplement.types';
import SupplementCard from '../SupplementCard';
import LottieLoader from '@/components/common/LottieLoader';
import styles from './styles.module.css';

interface SupplementGridProps {
  supplements: Supplement[];
  onAddToCart?: (supplementId: string, quantity: number) => void;
  loading?: boolean;
}

const SupplementGrid: React.FC<SupplementGridProps> = ({ supplements, onAddToCart, loading = false }) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
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
      <ul className={styles.grid} aria-label="Supplement products">
        {supplements.map((supplement) => (
          <li key={supplement._id}>
            <SupplementCard supplement={supplement} onAddToCart={onAddToCart} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupplementGrid;
