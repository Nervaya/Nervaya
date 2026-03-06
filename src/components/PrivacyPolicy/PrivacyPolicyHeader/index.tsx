import { Icon } from '@iconify/react';
import { ICON_SHIELD, ICON_CLOCK } from '@/constants/icons';
import styles from './styles.module.css';

const PrivacyPolicyHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerBadge}>
          <Icon icon={ICON_SHIELD} className={styles.badgeIcon} />
          <span className={styles.badgeText}>Privacy</span>
        </div>
        <h1 className={styles.headerTitle}>Privacy Policy</h1>
        <p className={styles.headerSubtitle}>
          Your privacy is important to us. This policy explains how we collect, use, and protect your personal
          information.
        </p>
        <div className={styles.lastUpdated}>
          <Icon icon={ICON_CLOCK} />
          <span>Last Updated: January 1, 2026</span>
        </div>
      </div>
    </header>
  );
};

export default PrivacyPolicyHeader;
