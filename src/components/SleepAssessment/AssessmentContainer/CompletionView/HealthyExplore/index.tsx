import Link from 'next/link';
import { Icon } from '@iconify/react';
import type { ServiceRecommendation } from '@/utils/sleepAssessment';
import styles from './styles.module.css';

interface HealthyExploreProps {
  services: ServiceRecommendation[];
}

export function HealthyExplore({ services }: HealthyExploreProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Keep Up the Good Work</h2>
      <p className={styles.sub}>
        Your sleep is in a great place. Explore our services to maintain and further optimize it.
      </p>
      <ul className={styles.list} aria-label="Sleep services">
        {services.map((svc) => (
          <li key={svc.name}>
            <Link href={svc.href} className={styles.card}>
              <div className={styles.icon}>
                <Icon icon={svc.icon} />
              </div>
              <div className={styles.info}>
                <h3 className={styles.cardTitle}>{svc.title}</h3>
                <p className={styles.cardDesc}>{svc.description}</p>
              </div>
              <Icon icon="solar:arrow-right-linear" className={styles.arrow} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
