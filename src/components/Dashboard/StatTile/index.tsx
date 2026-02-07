'use client';

import Link from 'next/link';
import React from 'react';
import styles from './StatTile.module.css';

interface TileCta {
  label: string;
  href: string;
}

interface StatTileProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: React.ReactNode;
  cta?: TileCta;
}

export function StatTile({ title, value, subtitle, icon, cta }: StatTileProps) {
  return (
    <article className={styles.tile}>
      <div className={styles.topRow}>
        <div style={{ minWidth: 0 }}>
          <p className={styles.title}>{title}</p>
          <p className={styles.value}>{value}</p>
        </div>
        <div className={styles.iconWrap} aria-hidden>
          {icon}
        </div>
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {cta && (
        <Link href={cta.href} className={styles.cta}>
          {cta.label}
        </Link>
      )}
    </article>
  );
}
