import { FaRegCommentDots } from 'react-icons/fa';
import styles from './styles.module.css';

const SupportCards = () => {
  return (
    <div className={styles.supportSection}>
      <div className={styles.supportCard}>
        <div className={styles.supportContent}>
          <div className={styles.supportIcon}>
            <FaRegCommentDots />
          </div>
          <div className={styles.supportTextContainer}>
            <h3 className={styles.cardHeading} style={{ fontSize: '1.5rem' }}>
              Not Satisfied with the session?
            </h3>
            <p className={styles.cardParagraph} style={{ marginBottom: 0 }}>
              You can request for an additional session free of charge
            </p>
          </div>
        </div>
        <button className={styles.supportButton}>Request Re-Session</button>
      </div>

      <div className={styles.supportCard}>
        <div className={styles.supportContent}>
          <div className={styles.supportIcon}>
            <FaRegCommentDots />
          </div>
          <div className={styles.supportTextContainer}>
            <h3 className={styles.cardHeading} style={{ fontSize: '1.5rem' }}>
              Have doubts about Deep Rest Sessions?
            </h3>
            <p className={styles.cardParagraph} style={{ marginBottom: 0 }}>
              Our specialists are here to help you get started
            </p>
          </div>
        </div>
        <button className={styles.supportButton}>Free 1 on 1 Assistance</button>
      </div>
    </div>
  );
};

export default SupportCards;
