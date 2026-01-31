'use client';

import styles from './styles.module.css';

interface BookingModalHeaderProps {
  therapistName: string;
  onClose: () => void;
}

export function BookingModalHeader({ therapistName, onClose }: BookingModalHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>Book Your Appointment</h2>
        <p className={styles.subtitle}>with {therapistName}</p>
      </div>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close booking modal">
        Close
      </button>
    </div>
  );
}
