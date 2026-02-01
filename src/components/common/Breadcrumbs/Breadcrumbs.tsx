'use client';

import React from 'react';
import Link from 'next/link';
import { FaHouse } from 'react-icons/fa6';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;
          const key = `${item.label}-${item.href ?? 'current'}`;

          return (
            <li key={key} className={styles.item}>
              {index > 0 && (
                <span className={styles.separator} aria-hidden>
                  →
                </span>
              )}
              {isFirst && item.href ? (
                <Link href={item.href} className={styles.link} aria-current={isLast ? 'page' : undefined}>
                  <FaHouse className={styles.icon} aria-hidden />
                  <span>{item.label}</span>
                </Link>
              ) : item.href && !isLast ? (
                <Link href={item.href} className={styles.link} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
