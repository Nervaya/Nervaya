"use client";

import styles from './styles.module.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    description?: string;
}

const PageHeader = ({ title, subtitle, description }: PageHeaderProps) => {
    return (
        <div className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {description && <p className={styles.description}>{description}</p>}
        </div>
    );
};

export default PageHeader;
