import Link from 'next/link';
import { Icon } from '@iconify/react';
import type { ServiceRecommendation } from '@/utils/sleepAssessment';
import styles from './styles.module.css';

interface ServiceCardProps {
  service: ServiceRecommendation;
  reason: string;
  dotColor: string;
  isAdding: boolean;
  onAddToCart: () => void;
}

export function ServiceCard({ service, reason, dotColor, isAdding, onAddToCart }: ServiceCardProps) {
  const isHigh = service.priority === 'High';
  const isLow = service.priority === 'Low';

  return (
    <li className={`${styles.card} ${isHigh ? styles.cardHigh : ''}`}>
      <div className={styles.top}>
        {isHigh && <span className={styles.recommended}>Highly Recommended</span>}
        {(isHigh || isLow) && (
          <span className={`${styles.pill} ${isHigh ? styles.pillHigh : styles.pillLow}`}>{service.priority}</span>
        )}
      </div>

      <div className={styles.header}>
        <div className={styles.icon}>
          <Icon icon={service.icon} />
        </div>
        <h3 className={styles.title}>{service.title}</h3>
      </div>

      <div className={styles.reason}>
        <span className={styles.reasonDot} style={{ background: dotColor }} />
        <span className={styles.reasonText}>{reason}</span>
      </div>

      <p className={styles.desc}>{service.description}</p>

      <div className={styles.actions}>
        <Link href={service.href} className={styles.btnPrimary}>
          {service.primaryCta}
        </Link>
        <button type="button" className={styles.btnOutline} disabled={isAdding} onClick={onAddToCart}>
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </li>
  );
}
