import styles from './styles.module.css';
import { aboutUsStatsData } from '@/utils/aboutUsStatsData';

const AboutUsStats = () => {
  return (
    <section className={styles.statsSection}>
      <ul className={styles.statsContainer}>
        {aboutUsStatsData.map((stat, index) => (
          <li key={stat.id} className={styles.statItem}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
            {index < aboutUsStatsData.length - 1 && (
              <div className={styles.statDivider}></div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AboutUsStats;
