'use client';

import { useState } from 'react';
import TimeSlotGrid from '../TimeSlotGrid';
import DatePicker from '../DatePicker';
import { BookingModalHeader } from './BookingModalHeader';
import { BookingModalFooter } from './BookingModalFooter';
import { useBookingSlots } from './useBookingSlots';
import styles from './styles.module.css';

interface BookingModalProps {
  therapistId: string;
  therapistName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ therapistId, therapistName, onClose, onSuccess }: BookingModalProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxBookingDate = new Date();
  maxBookingDate.setMonth(maxBookingDate.getMonth() + 1);
  maxBookingDate.setHours(23, 59, 59, 999);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { schedule, loading, error: slotsError, fetchSlots } = useBookingSlots(therapistId, selectedDate);

  const handleDateSelect = (date: Date) => {
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
    setSelectedSlot(null);
    setError(null);
  };

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
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId,
          date: schedule.date,
          startTime: slot.startTime,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to book session');
      setSuccessMessage('Session booked successfully!');
      onSuccess?.();
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error booking session. Please try again.';
      setError(errorMessage);
      if (errorMessage.includes('not available') || errorMessage.includes('already booked')) {
        fetchSlots();
      }
    } finally {
      setBooking(false);
    }
  };

  const displayError = error || slotsError;
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const slotsForGrid =
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
    })) || [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <BookingModalHeader therapistName={therapistName} onClose={onClose} />
        <div className={styles.content}>
          <div className={styles.dateSection}>
            <h3 className={styles.sectionTitle}>Select Date</h3>
            <DatePicker
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              minDate={today}
              maxDate={maxBookingDate}
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
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading available slots...</p>
              </div>
            ) : displayError && !loading ? (
              <div className={styles.errorMessage}>
                <p>{displayError}</p>
                <button type="button" className={styles.retryBtn} onClick={fetchSlots}>
                  Retry
                </button>
              </div>
            ) : (
              <TimeSlotGrid
                slots={slotsForGrid}
                selectedSlot={selectedSlot}
                onSlotSelect={(id) => {
                  setSelectedSlot(id);
                  setError(null);
                }}
              />
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
}
