'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Supplement } from '@/types/supplement.types';
import SupplementToolbar, { type ViewMode, type SortOption } from '../SupplementToolbar';
import SupplementProductGrid from '../SupplementProductGrid';
import LottieLoader from '@/components/common/LottieLoader';
import type { PriceRange } from '../SupplementFilters';
import styles from './SupplementCatalog.module.css';

interface SupplementCatalogProps {
  supplements: Supplement[];
  loading?: boolean;
  onAddToCart?: (supplementId: string, quantity: number) => Promise<void> | void;
}

const SupplementCatalog: React.FC<SupplementCatalogProps> = ({ supplements, loading = false, onAddToCart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: undefined });
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const priceBounds = useMemo(() => {
    if (supplements.length === 0) return { min: 0, max: 0 };
    const prices = supplements.map((s) => s.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [supplements]);

  const filteredAndSorted = useMemo(() => {
    let result = [...supplements];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.shortDescription && s.shortDescription.toLowerCase().includes(q)),
      );
    }

    if (priceRange.min > 0) {
      result = result.filter((s) => s.price >= priceRange.min);
    }
    if (priceRange.max != null && priceRange.max > 0) {
      const maxPrice = priceRange.max;
      result = result.filter((s) => s.price <= maxPrice);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [supplements, searchQuery, priceRange, sortBy]);

  const handlePriceChange = useCallback((range: PriceRange) => {
    setPriceRange(range);
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <LottieLoader width={200} height={200} />
      </div>
    );
  }

  return (
    <div className={styles.catalog}>
      <SupplementToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        priceRange={priceRange}
        onPriceChange={handlePriceChange}
        priceBounds={priceBounds}
      />
      <div className={styles.main}>
        <SupplementProductGrid supplements={filteredAndSorted} viewMode={viewMode} onAddToCart={onAddToCart} />
      </div>
    </div>
  );
};

export default SupplementCatalog;
