'use client';

import React from 'react';
import { Supplement } from '@/types/supplement.types';
import SupplementCard from '../SupplementCard';
import { useLoading } from '@/context/LoadingContext';
import styles from './styles.module.css';

interface SupplementGridProps {
  supplements: Supplement[];
  onAddToCart?: (supplementId: string, quantity: number) => void;
  loading?: boolean;
}

const SupplementGrid: React.FC<SupplementGridProps> = ({ supplements, onAddToCart, loading = false }) => {
  const { showLoader, hideLoader } = useLoading();

  React.useEffect(() => {
    if (loading) {
      showLoader('Loading supplements...');
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
