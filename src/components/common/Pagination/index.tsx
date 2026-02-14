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
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const first = 1;
  const middle = page <= 2 ? 2 : page >= totalPages - 1 ? totalPages - 1 : page;
  const last = totalPages;
  const pages: (number | 'ellipsis')[] = [first];
  if (middle - first > 1) pages.push('ellipsis');
  pages.push(middle);
  if (last - middle > 1) pages.push('ellipsis');
  pages.push(last);
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
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageItems = totalPages >= 1 ? getPaginationPages(page, totalPages) : [];
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

  const noData = total === 0;

  return (
    <nav className={styles.pagination} aria-label={ariaLabel}>
      <p className={styles.paginationSummary}>
        Showing {start}–{end} of {total}
      </p>
      <div className={styles.paginationControls}>
        <button
          type="button"
          onClick={() => !noData && onPageChange(page - 1)}
          disabled={page <= 1 || noData}
          className={styles.paginationButton}
          aria-label="Previous page"
        >
          <FaChevronLeft aria-hidden />
          Previous
        </button>
        <div className={styles.paginationNumbers}>
          {noData ? (
            <button
              type="button"
              disabled
              className={`${styles.paginationNumber} ${styles.paginationNumberActive}`}
              aria-label="Page 1"
              aria-current="page"
            >
              1
            </button>
          ) : (
            pageItemsWithKeys.map(({ item, key }) =>
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
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => !noData && onPageChange(page + 1)}
          disabled={page >= totalPages || noData}
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
