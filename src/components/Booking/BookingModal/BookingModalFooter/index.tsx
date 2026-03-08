'use client';

import styles from './styles.module.css';

interface BookingModalFooterProps {
  selectedSlot: string | null;
  booking: boolean;
  loading: boolean;
  onBook: () => void;
  therapistId?: string;
  therapistName?: string;
  selectedDate?: string;
  sessionFee?: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
};

export function BookingModalFooter({
  selectedSlot,
  booking,
  loading,
  onBook,
  therapistId: _therapistId,
  therapistName,
  selectedDate,
  sessionFee,
}: BookingModalFooterProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.footer}>
      <div className={styles.sessionDetails}>
        {(therapistName || selectedDate) && (
          <div className={styles.sessionInfo}>
            {therapistName && <span className={styles.therapistName}>{therapistName}</span>}
            {therapistName && selectedDate && <span className={styles.separator}> • </span>}
            {selectedDate && <span className={styles.sessionDate}>{formatDate(selectedDate)}</span>}
            {selectedSlot && <span className={styles.sessionTime}> at {selectedSlot}</span>}
          </div>
        )}
        {sessionFee && (
          <div className={styles.priceSection}>
            <span className={styles.price}>{formatPrice(sessionFee)}</span>
          </div>
        )}
      </div>
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
