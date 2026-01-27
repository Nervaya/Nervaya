import { IoShieldOutline, IoTimeOutline } from "react-icons/io5";
import styles from "./styles.module.css";

const PrivacyPolicyHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerBadge}>
          <IoShieldOutline className={styles.badgeIcon} />
          <span className={styles.badgeText}>Privacy</span>
        </div>
        <h1 className={styles.headerTitle}>Privacy Policy</h1>
        <p className={styles.headerSubtitle}>
          Your privacy is important to us. This policy explains how we collect,
          use, and protect your personal information.
        </p>
        <div className={styles.lastUpdated}>
          <IoTimeOutline />
          <span>Last Updated: January 1, 2026</span>
        </div>
      </div>
    </header>
  );
};

export default PrivacyPolicyHeader;
