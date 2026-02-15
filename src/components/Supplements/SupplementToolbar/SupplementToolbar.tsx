'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaTableCells, FaList, FaFilter } from 'react-icons/fa6';
import SupplementFilters, { type PriceRange } from '../SupplementFilters';
import styles from './SupplementToolbar.module.css';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured Items' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
];

interface SupplementToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
  priceRange: PriceRange;
  onPriceChange: (range: PriceRange) => void;
  priceBounds: { min: number; max: number };
}

const SupplementToolbar: React.FC<SupplementToolbarProps> = ({
  searchValue,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceChange,
  priceBounds,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const filterWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverOpen && filterWrapperRef.current && !filterWrapperRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopoverOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [popoverOpen]);

  const filterContent = (
    <>
      <SupplementFilters priceBounds={priceBounds} value={priceRange} onChange={onPriceChange} />
      <button
        type="button"
        className={styles.filterClose}
        onClick={() => setPopoverOpen(false)}
        aria-label="Close filter"
      >
        Done
      </button>
    </>
  );

  return (
    <div className={styles.toolbar} ref={filterWrapperRef}>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Filter products by name, SKU, att."
        className={styles.searchInput}
        aria-label="Filter products"
      />
      <div className={styles.controls}>
        <div className={styles.filterWrapper}>
          <button
            type="button"
            onClick={() => setPopoverOpen((o) => !o)}
            className={`${styles.filterButton} ${popoverOpen ? styles.active : ''}`}
            aria-label="Filters"
            aria-expanded={popoverOpen}
            aria-haspopup="dialog"
          >
            <FaFilter aria-hidden />
            <span>Filters</span>
          </button>
          {popoverOpen && (
            <div className={styles.popover} role="dialog" aria-label="Price filter">
              {filterContent}
            </div>
          )}
        </div>
        <div className={styles.viewToggle} role="group" aria-label="View mode">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <FaTableCells aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <FaList aria-hidden />
          </button>
        </div>
        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>SORT BY:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className={styles.sortSelect}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {popoverOpen && (
        <div className={styles.filterInline} role="dialog" aria-label="Price filter">
          {filterContent}
        </div>
      )}
    </div>
  );
};

export default SupplementToolbar;
