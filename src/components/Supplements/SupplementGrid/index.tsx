'use client';

import React, { useState } from 'react';
import { Supplement } from '@/types/supplement.types';
import SupplementCard from '../SupplementCard';
import styles from './styles.module.css';

interface SupplementGridProps {
  supplements: Supplement[];
  onAddToCart?: (supplementId: string, quantity: number) => void;
  loading?: boolean;
}

const SupplementGrid: React.FC<SupplementGridProps> = ({ supplements, onAddToCart, loading = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(supplements.map((s) => s.category))];

  const filteredSupplements =
    selectedCategory === 'all' ? supplements : supplements.filter((s) => s.category === selectedCategory);

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
      {categories.length > 2 && (
        <div className={styles.filters}>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      )}
      <div className={styles.grid}>
        {filteredSupplements.map((supplement) => (
          <SupplementCard key={supplement._id} supplement={supplement} onAddToCart={onAddToCart} />
        ))}
      </div>
      {filteredSupplements.length === 0 && (
        <div className={styles.empty}>
          <p>No supplements found in this category</p>
        </div>
      )}
    </div>
  );
};

export default SupplementGrid;
