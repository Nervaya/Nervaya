'use client';

import { useState, useCallback } from 'react';
import type { SupplementFiltersParams } from '@/lib/api/supplements';
import { Dropdown } from '@/components/common';
import styles from '../FilterBar/styles.module.css';

const ACTIVE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Active only' },
  { value: 'false', label: 'Inactive only' },
];

export interface SupplementFiltersProps {
  initialFilters?: SupplementFiltersParams;
  onApply: (filters: SupplementFiltersParams) => void;
  onReset: () => void;
  activeCount?: number;
}

export default function SupplementFilters({
  initialFilters = {},
  onApply,
  onReset,
  activeCount = 0,
}: SupplementFiltersProps) {
  const [isActive, setIsActive] = useState(
    initialFilters.isActive === undefined ? '' : String(initialFilters.isActive),
  );
  const [search, setSearch] = useState(initialFilters.search ?? '');
  const [minStock, setMinStock] = useState(initialFilters.minStock?.toString() ?? '');
  const [maxStock, setMaxStock] = useState(initialFilters.maxStock?.toString() ?? '');

  const handleApply = useCallback(() => {
    const filters: SupplementFiltersParams = {};
    if (isActive === 'true') filters.isActive = true;
    if (isActive === 'false') filters.isActive = false;
    if (search.trim()) filters.search = search.trim();
    const min = minStock ? Number(minStock) : undefined;
    const max = maxStock ? Number(maxStock) : undefined;
    if (min != null && !Number.isNaN(min)) filters.minStock = min;
    if (max != null && !Number.isNaN(max)) filters.maxStock = max;
    onApply(filters);
  }, [isActive, search, minStock, maxStock, onApply]);

  const handleReset = useCallback(() => {
    setIsActive('');
    setSearch('');
    setMinStock('');
    setMaxStock('');
    onReset();
  }, [onReset]);

  return (
    <div className={styles.bar} role="search" aria-label="Filter supplements">
      <div className={styles.field}>
        <label htmlFor="supplement-active">Status</label>
        <Dropdown
          id="supplement-active"
          options={ACTIVE_OPTIONS}
          value={isActive}
          onChange={setIsActive}
          ariaLabel="Active status"
        />
      </div>
      <div className={styles.field} style={{ minWidth: '180px' }}>
        <label htmlFor="supplement-search">Search name/description</label>
        <input
          id="supplement-search"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search supplements"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="supplement-min-stock">Min stock</label>
        <input
          id="supplement-min-stock"
          type="number"
          min={0}
          step={1}
          placeholder="Min"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          aria-label="Minimum stock"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="supplement-max-stock">Max stock</label>
        <input
          id="supplement-max-stock"
          type="number"
          min={0}
          step={1}
          placeholder="Max"
          value={maxStock}
          onChange={(e) => setMaxStock(e.target.value)}
          aria-label="Maximum stock"
        />
      </div>
      <div className={styles.actions}>
        {activeCount > 0 && <span className={styles.badge}>{activeCount} filter(s) active</span>}
        <button type="button" onClick={handleApply} className={styles.applyButton}>
          Apply
        </button>
        <button type="button" onClick={handleReset} className={styles.resetButton}>
          Reset
        </button>
      </div>
    </div>
  );
}
