'use client';

import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { ICON_ARROW_UP, ICON_ARROW_DOWN } from '@/constants/icons';
import Pagination from '@/components/common/Pagination';
import styles from './styles.module.css';

export type ColumnAlign = 'left' | 'center' | 'right';
export type SortDirection = 'asc' | 'desc';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  align?: ColumnAlign;
  width?: string;
  minWidth?: string;
  hideOn?: 'sm' | 'md';
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number | Date | null | undefined;
}

export interface DataTablePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T) => string;
  title?: React.ReactNode;
  countLabel?: (total: number) => React.ReactNode;
  total?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  caption?: string;
  onRowClick?: (row: T) => void;
  pagination?: DataTablePagination;
  className?: string;
  ariaLabel?: string;
}

interface SortState {
  key: string;
  direction: SortDirection;
}

function columnClassName(align: ColumnAlign | undefined, hideOn: 'sm' | 'md' | undefined): string {
  const classes: string[] = [];
  if (align === 'center') classes.push(styles.alignCenter);
  if (align === 'right') classes.push(styles.alignRight);
  if (hideOn === 'sm') classes.push(styles.hideSm);
  if (hideOn === 'md') classes.push(styles.hideMd);
  return classes.join(' ');
}

function sortRows<T>(rows: T[], column: ColumnDef<T>, direction: SortDirection): T[] {
  const accessor = column.sortAccessor;
  if (!accessor) return rows;
  const sorted = [...rows].sort((a, b) => {
    const av = accessor(a);
    const bv = accessor(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  });
  return direction === 'asc' ? sorted : sorted.reverse();
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  title,
  countLabel,
  total,
  isLoading = false,
  emptyMessage = 'No results.',
  caption,
  onRowClick,
  pagination,
  className = '',
  ariaLabel,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(null);

  const handleHeaderClick = useCallback((column: ColumnDef<T>) => {
    if (!column.sortable || !column.sortAccessor) return;
    setSort((prev) => {
      if (!prev || prev.key !== column.key) return { key: column.key, direction: 'asc' };
      if (prev.direction === 'asc') return { key: column.key, direction: 'desc' };
      return null;
    });
  }, []);

  const sortedData = React.useMemo(() => {
    if (!sort) return data;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return data;
    return sortRows(data, column, sort.direction);
  }, [data, columns, sort]);

  const resolvedTotal = total ?? pagination?.total ?? sortedData.length;
  const rootClass = [styles.root, className].filter(Boolean).join(' ');

  return (
    <section className={rootClass} aria-label={ariaLabel}>
      {(title || countLabel) && (
        <header className={styles.titleBar}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {countLabel && <span className={styles.count}>{countLabel(resolvedTotal)}</span>}
        </header>
      )}
      <div className={styles.scroll}>
        <table className={styles.table}>
          {caption && <caption className={styles.srOnly}>{caption}</caption>}
          <thead className={styles.thead}>
            <tr>
              {columns.map((column) => {
                const isSorted = sort?.key === column.key;
                const isSortable = Boolean(column.sortable && column.sortAccessor);
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={columnClassName(column.align, column.hideOn)}
                    style={{ width: column.width, minWidth: column.minWidth }}
                    aria-sort={isSorted ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {isSortable ? (
                      <button type="button" className={styles.headerButton} onClick={() => handleHeaderClick(column)}>
                        <span>{column.header}</span>
                        <Icon
                          icon={isSorted && sort?.direction === 'desc' ? ICON_ARROW_DOWN : ICON_ARROW_UP}
                          width={14}
                          height={14}
                          className={`${styles.sortIcon} ${isSorted ? styles.sortIconActive : ''}`}
                          aria-hidden
                        />
                      </button>
                    ) : (
                      <span className={styles.headerLabel}>{column.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {isLoading ? (
              <tr className={styles.placeholderRow}>
                <td colSpan={columns.length} className={styles.placeholderCell}>
                  Loading…
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr className={styles.placeholderRow}>
                <td colSpan={columns.length} className={styles.placeholderCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => {
                const clickable = Boolean(onRowClick);
                return (
                  <tr
                    key={rowKey(row)}
                    className={clickable ? styles.clickableRow : undefined}
                    onClick={clickable ? () => onRowClick?.(row) : undefined}
                    onKeyDown={
                      clickable
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              onRowClick?.(row);
                            }
                          }
                        : undefined
                    }
                    tabIndex={clickable ? 0 : undefined}
                    role={clickable ? 'button' : undefined}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={columnClassName(column.align, column.hideOn)}
                        style={{ width: column.width, minWidth: column.minWidth }}
                      >
                        {column.cell(row, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <footer className={styles.footer}>
          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            ariaLabel={pagination.ariaLabel ?? 'Table pagination'}
          />
        </footer>
      )}
    </section>
  );
}

export default DataTable;
