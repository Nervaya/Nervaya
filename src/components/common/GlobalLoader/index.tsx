'use client';

import React from 'react';
import styles from './styles.module.css';

export interface GlobalLoaderProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  label?: string;
  centerPage?: boolean;
}

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function isInlineSize(value: number | string): boolean {
  return typeof value === 'number' && value <= 64;
}

export default function GlobalLoader({
  width = 120,
  height = 120,
  className = '',
  label,
  centerPage,
}: GlobalLoaderProps) {
  const shouldCenterPage = centerPage ?? !(isInlineSize(width) && isInlineSize(height));
  const loaderStyle = {
    '--loader-width': toCssSize(width),
    '--loader-height': toCssSize(height),
  } as React.CSSProperties;

  return (
    <div
      className={`${styles.root} ${shouldCenterPage ? styles.page : styles.inline}${className ? ` ${className}` : ''}`}
      style={loaderStyle}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label || 'Loading'}
    >
      <div className={styles.shell} aria-hidden>
        <span className={styles.spinner}></span>
      </div>
      {label ? <p className={styles.label}>{label}</p> : null}
    </div>
  );
}
