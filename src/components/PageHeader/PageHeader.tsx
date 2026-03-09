import React, { type ReactNode } from 'react';
import styles from './styles.module.css';
import Breadcrumbs, { type BreadcrumbItem } from '../common/Breadcrumbs';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

const PageHeader = ({ title, subtitle, description, actions, breadcrumbs }: PageHeaderProps) => {
  return (
    <div className={styles.header}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className={styles.breadcrumbsWrapper}>
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div className={styles.mainRow}>
        <div className={styles.titleSection}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
