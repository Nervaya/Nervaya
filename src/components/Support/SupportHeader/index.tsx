import { IoHeadsetOutline } from 'react-icons/io5';
import styles from './styles.module.css';

const SupportHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerBadge}>
          <IoHeadsetOutline className={styles.badgeIcon} />
          <span className={styles.badgeText}>Support</span>
        </div>
        <h1 className={styles.headerTitle}>We&apos;re Here to Help</h1>
        <p className={styles.headerSubtitle}>
          Have questions or need assistance? Reach out anytime—our team is ready to support your journey to
          better sleep.
        </p>
      </div>
    </header>
  );
};

export default SupportHeader;
