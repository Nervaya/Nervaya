'use client';

import styles from './styles.module.css';

interface BookingModalFooterProps {
  selectedSlot: string | null;
  booking: boolean;
  loading: boolean;
  onBook: () => void;
}

export function BookingModalFooter({ selectedSlot, booking, loading, onBook }: BookingModalFooterProps) {
  return (
    <div className={styles.footer}>
      <p className={styles.helpText}>
        Trouble finding a slot? <a href="/support">Let Us Help You</a>
      </p>
      <button
        className={styles.bookBtn}
        disabled={!selectedSlot || booking || loading}
        onClick={onBook}
        aria-label="Book selected session"
      >
        {booking ? 'Booking...' : 'Book Session'}
      </button>
    </div>
  );
}
