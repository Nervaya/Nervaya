'use client';

import React from 'react';
import { Supplement } from '@/types/supplement.types';
import SupplementProductCard from '../SupplementProductCard';
import type { ViewMode } from '../SupplementToolbar';
import styles from './SupplementProductGrid.module.css';

interface SupplementProductGridProps {
  supplements: Supplement[];
  viewMode: ViewMode;
  onAddToCart?: (supplementId: string, quantity: number) => Promise<void> | void;
}

const SupplementProductGrid: React.FC<SupplementProductGridProps> = ({ supplements, viewMode, onAddToCart }) => {
  if (supplements.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No supplements match your filters.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.grid} ${viewMode === 'list' ? styles.listView : styles.gridView}`} role="list">
      {supplements.map((supplement) => (
        <div key={supplement._id} role="listitem">
          <SupplementProductCard supplement={supplement} onAddToCart={onAddToCart} variant={viewMode} />
        </div>
      ))}
    </div>
  );
};

export default SupplementProductGrid;
