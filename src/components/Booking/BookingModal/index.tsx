'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import TimeSlotGrid from '../TimeSlotGrid';
import DatePicker from '../DatePicker';
import LottieLoader from '@/components/common/LottieLoader';
import { BookingModalHeader } from './BookingModalHeader';
import { BookingModalFooter } from './BookingModalFooter';
import { sessionsApi } from '@/lib/api/sessions';
import { useBookingSlots } from './useBookingSlots';
import { trackSelectTimeSlot, trackBookingCompleted, trackBookingAbandoned } from '@/utils/analytics';
import styles from './styles.module.css';

interface BookingModalProps {
  therapistId: string;
  therapistName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ therapistId, therapistName, onClose, onSuccess }: BookingModalProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const maxBookingDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const bookingCompletedRef = useRef(false);

  const handleMonthChange = useCallback((monthStart: Date) => setVisibleMonth(monthStart), []);

  const {
    schedule,
    loading,
    error: slotsError,
    fetchSlots,
    fullyBookedDates,
  } = useBookingSlots(therapistId, selectedDate, visibleMonth);

  const slotsForGrid = useMemo(
    () =>
      schedule?.slots.map((slot) => ({
        _id: slot.startTime,
        therapistId,
        date: schedule.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
        isCustomized: slot.isCustomized,
        sessionId: slot.sessionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })) ?? [],
    [schedule, therapistId],
  );

  const handleClose = useCallback(() => {
    if (!bookingCompletedRef.current) {
      trackBookingAbandoned({ therapist_id: therapistId, therapist_name: therapistName });
    }
    onClose();
  }, [therapistId, therapistName, onClose]);

  const handleSlotSelect = useCallback(
    (id: string) => {
      setSelectedSlot(id);
      setError(null);
      const slot = slotsForGrid.find((s) => s._id === id);
      if (slot) {
        trackSelectTimeSlot({
          therapist_id: therapistId,
          therapist_name: therapistName,
          slot_time: slot.startTime,
          slot_date: slot.date,
        });
      }
    },
    [slotsForGrid, therapistId, therapistName],
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      const todayOnly = new Date(today);
      todayOnly.setHours(0, 0, 0, 0);
      const maxDateOnly = new Date(maxBookingDate);
      maxDateOnly.setHours(0, 0, 0, 0);
      if (dateOnly < todayOnly) {
        setError('Cannot book sessions in the past');
        return;
      }
      if (dateOnly > maxDateOnly) {
        setError('Bookings are only available up to 1 month in advance');
        return;
      }
      setSelectedDate(date);
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      setSelectedSlot(null);
      setError(null);
    },
    [today, maxBookingDate],
  );

  const handleBookSession = async () => {
    if (!selectedSlot || !schedule) {
      setError('Please select a time slot');
      return;
    }
    const slot = schedule.slots.find((s) => s.startTime === selectedSlot);
    if (!slot || !slot.isAvailable) {
      setError('This slot has been booked. Please select another.');
      setSelectedSlot(null);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !schedule) return;
    const slot = schedule.slots.find((s) => s.startTime === selectedSlot);
    if (!slot || !slot.isAvailable) return;

    setShowConfirm(false);
    setBooking(true);
    setError(null);
    try {
      await sessionsApi.create(therapistId, schedule.date, slot.startTime);
      bookingCompletedRef.current = true;
      trackBookingCompleted({
        therapist_id: therapistId,
        therapist_name: therapistName,
        slot_time: slot.startTime,
        slot_date: schedule.date,
      });
      setSuccessMessage('Session booked successfully!');
      onSuccess?.();
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      const errorMessage =
        (err as { message?: string })?.message ||
        (err instanceof Error ? err.message : 'Error booking session. Please try again.');
      setError(errorMessage);
      if (errorMessage.includes('not available') || errorMessage.includes('already booked')) {
        fetchSlots();
      }
    } finally {
      setBooking(false);
    }
  };

  const displayError = error || slotsError;

  const formatDate = useCallback(
    (date: Date) =>
      date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [],
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const modalContent = (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <BookingModalHeader therapistName={therapistName} onClose={handleClose} />
        <div className={styles.content}>
          <div className={styles.dateSection}>
            <h3 className={styles.sectionTitle}>Select Date</h3>
            <DatePicker
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              minDate={today}
              maxDate={maxBookingDate}
              fullyBookedDates={fullyBookedDates}
              onMonthChange={handleMonthChange}
            />
            {selectedDate && (
              <p className={styles.selectedDateText}>
                Selected: <strong>{formatDate(selectedDate)}</strong>
              </p>
            )}
          </div>
          <div className={styles.slotsSection}>
            <h3 className={styles.sectionTitle}>Available Time Slots</h3>
            {loading ? (
              <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
                <LottieLoader width={160} height={160} />
              </div>
            ) : displayError && !loading ? (
              <div className={styles.errorMessage}>
                <p>{displayError}</p>
                <button type="button" className={styles.retryBtn} onClick={fetchSlots}>
                  Retry
                </button>
              </div>
            ) : (
              <TimeSlotGrid slots={slotsForGrid} selectedSlot={selectedSlot} onSlotSelect={handleSlotSelect} />
            )}
          </div>
        </div>
        {displayError && !loading && (
          <div className={styles.errorBanner}>
            <span className={styles.errorIcon}>Warning</span>
            <span>{displayError}</span>
          </div>
        )}
        {successMessage && (
          <div className={styles.successBanner} role="status">
            <span>{successMessage}</span>
          </div>
        )}
        {showConfirm && schedule && selectedSlot && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmDialog}>
              <p>
                Confirm booking for <strong>{therapistName}</strong> on {schedule.date} at {selectedSlot}?
              </p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.confirmCancel} onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
                <button type="button" className={styles.confirmOk} onClick={handleConfirmBooking}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        <BookingModalFooter
          selectedSlot={selectedSlot}
          booking={booking}
          loading={loading}
          onBook={handleBookSession}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
