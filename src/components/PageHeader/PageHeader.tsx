'use client';

import type { ReactNode } from 'react';
import styles from './styles.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
}

const PageHeader = ({ title, subtitle, description, actions }: PageHeaderProps) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {description && <p className={styles.description}>{description}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
};

export default PageHeader;
