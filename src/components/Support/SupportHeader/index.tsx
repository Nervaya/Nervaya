import styles from './styles.module.css';

const SupportHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.headerTitle}>We&apos;re Here to Help</h1>
        <p className={styles.headerSubtitle}>
          Have questions or need assistance? Reach out anytime... our team is ready to support your journey to better
          sleep.
        </p>
      </div>
    </header>
  );
};

export default SupportHeader;
