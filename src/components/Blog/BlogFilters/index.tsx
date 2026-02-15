'use client';

import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Dropdown } from '@/components/common';
import styles from './styles.module.css';

interface BlogFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  allTags: string[];
  selectedTag: string | null;
  onFilterChange: (value: string | null) => void;
}

export default function BlogFilters({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  allTags,
  selectedTag,
  onFilterChange,
}: BlogFiltersProps) {
  return (
    <div className={styles.filtersRow}>
      <form onSubmit={onSearchSubmit} className={styles.searchForm}>
        <FaMagnifyingGlass className={styles.searchIcon} aria-hidden />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="Search by title, author..."
          className={styles.searchInput}
          aria-label="Search blogs"
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>
      {allTags.length > 0 && (
        <div className={styles.filterSelectWrapper}>
          <label htmlFor="blog-filter" className={styles.filterLabel}>
            Filter by topic
          </label>
          <Dropdown
            id="blog-filter"
            options={[{ value: '', label: 'All topics' }, ...allTags.map((tag) => ({ value: tag, label: tag }))]}
            value={selectedTag ?? ''}
            onChange={(value) => onFilterChange(value || null)}
            ariaLabel="Filter by topic"
            className={styles.filterSelect}
          />
        </div>
      )}
    </div>
  );
}
