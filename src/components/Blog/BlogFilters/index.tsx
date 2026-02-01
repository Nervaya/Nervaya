'use client';

import { FaMagnifyingGlass } from 'react-icons/fa6';
import styles from './styles.module.css';

interface BlogFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  allTags: string[];
  selectedTag: string | null;
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
          <select
            id="blog-filter"
            value={selectedTag ?? ''}
            onChange={onFilterChange}
            className={styles.filterSelect}
            aria-label="Filter by topic"
          >
            <option value="">All topics</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
