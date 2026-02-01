'use client';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import styles from './styles.module.css';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

function getPaginationPages(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [];
  if (page <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(totalPages);
  } else if (page >= totalPages - 3) {
    pages.push(1);
    pages.push('ellipsis');
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('ellipsis');
    for (let i = page - 1; i <= page + 1; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(totalPages);
  }
  return pages;
}

export default function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  ariaLabel = 'Pagination',
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageItems = getPaginationPages(page, totalPages);
  const pageItemsWithKeys = pageItems.reduce<{ item: number | 'ellipsis'; key: string }[]>((acc, item) => {
    if (item === 'ellipsis') {
      const ellipsisCount = acc.filter((x) => x.item === 'ellipsis').length;
      acc.push({
        item,
        key: ellipsisCount === 0 ? 'ellipsis-before' : 'ellipsis-after',
      });
    } else {
      acc.push({ item, key: String(item) });
    }
    return acc;
  }, []);

  return (
    <nav className={styles.pagination} aria-label={ariaLabel}>
      <p className={styles.paginationSummary}>
        Showing {start}–{end} of {total}
      </p>
      <div className={styles.paginationControls}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={styles.paginationButton}
          aria-label="Previous page"
        >
          <FaChevronLeft aria-hidden />
          Previous
        </button>
        <div className={styles.paginationNumbers}>
          {pageItemsWithKeys.map(({ item, key }) =>
            item === 'ellipsis' ? (
              <span key={key} className={styles.paginationEllipsis} aria-hidden>
                …
              </span>
            ) : (
              <button
                key={key}
                type="button"
                onClick={() => onPageChange(item)}
                className={`${styles.paginationNumber} ${page === item ? styles.paginationNumberActive : ''}`}
                aria-label={`Page ${item}`}
                aria-current={page === item ? 'page' : undefined}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={styles.paginationButton}
          aria-label="Next page"
        >
          Next
          <FaChevronRight aria-hidden />
        </button>
      </div>
    </nav>
  );
}
