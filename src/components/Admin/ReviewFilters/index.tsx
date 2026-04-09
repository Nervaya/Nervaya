'use client';

import { useState, useCallback } from 'react';
import type { AdminReviewFiltersParams } from '@/lib/api/adminReviews';
import styles from '../FilterBar/styles.module.css';

const RATING_OPTIONS = [
  { value: '', label: 'All ratings' },
  { value: '1', label: '1 Star' },
  { value: '2', label: '2 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '5', label: '5 Stars' },
];

const VISIBILITY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Visible' },
  { value: 'false', label: 'Hidden' },
];

export interface ReviewFiltersProps {
  initialFilters?: AdminReviewFiltersParams;
  onApply: (filters: AdminReviewFiltersParams) => void;
  onReset: () => void;
  activeCount?: number;
}

export default function ReviewFilters({ initialFilters = {}, onApply, onReset, activeCount = 0 }: ReviewFiltersProps) {
  const [rating, setRating] = useState(initialFilters.rating?.toString() ?? '');
  const [visibility, setVisibility] = useState(
    initialFilters.isVisible !== undefined ? String(initialFilters.isVisible) : '',
  );
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom ?? '');
  const [dateTo, setDateTo] = useState(initialFilters.dateTo ?? '');

  const handleApply = useCallback(() => {
    const filters: AdminReviewFiltersParams = {};
    if (rating) filters.rating = Number(rating);
    if (visibility) filters.isVisible = visibility === 'true';
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    onApply(filters);
  }, [rating, visibility, dateFrom, dateTo, onApply]);

  const handleReset = useCallback(() => {
    setRating('');
    setVisibility('');
    setDateFrom('');
    setDateTo('');
    onReset();
  }, [onReset]);

  return (
    <div className={styles.bar} role="search" aria-label="Filter reviews">
      <div className={styles.field}>
        <label htmlFor="review-rating">Rating</label>
        <select id="review-rating" value={rating} onChange={(e) => setRating(e.target.value)} aria-label="Rating">
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="review-visibility">Visibility</label>
        <select
          id="review-visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          aria-label="Visibility"
        >
          {VISIBILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="review-date-from">Date from</label>
        <input
          id="review-date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="Date from"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="review-date-to">Date to</label>
        <input
          id="review-date-to"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="Date to"
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
