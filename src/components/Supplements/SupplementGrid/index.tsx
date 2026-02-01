'use client';

import React from 'react';
import { Supplement } from '@/types/supplement.types';
import SupplementCard from '../SupplementCard';
import styles from './styles.module.css';

interface SupplementGridProps {
  supplements: Supplement[];
  onAddToCart?: (supplementId: string, quantity: number) => void;
  loading?: boolean;
}

const SupplementGrid: React.FC<SupplementGridProps> = ({ supplements, onAddToCart, loading = false }) => {
  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading supplements...</p>
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
      <div className={styles.grid}>
        {supplements.map((supplement) => (
          <SupplementCard key={supplement._id} supplement={supplement} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
};

export default SupplementGrid;
