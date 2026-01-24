'use client';

import { useState, useEffect, useCallback } from 'react';
import TimeSlotGrid from '../TimeSlotGrid';
import DatePicker from '../DatePicker';
import styles from './styles.module.css';

interface TimeSlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    isCustomized: boolean;
    sessionId?: string;
}

interface Schedule {
    date: string;
    slots: TimeSlot[];
}

interface BookingModalProps {
    therapistId: string;
    therapistName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BookingModal({
    therapistId,
    therapistName,
    onClose,
    onSuccess,
}: BookingModalProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxBookingDate = new Date();
    maxBookingDate.setMonth(maxBookingDate.getMonth() + 1);
    maxBookingDate.setHours(23, 59, 59, 999);

    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSlots = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSelectedSlot(null);

        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await fetch(`/api/therapists/${therapistId}/schedule?date=${dateStr}&includeBooked=true`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch slots');
            }

            const result = await response.json();
            const bookedSlots = result.data?.bookedSlots || [];

            // Generate fixed 9 AM - 6 PM slots
            const generatedSlots = [];
            for (let i = 9; i <= 18; i++) { // 18 is 6 PM
                const hour = i > 12 ? i - 12 : i;
                const period = i >= 12 ? 'PM' : 'AM';
                // Adjust noon to 12 PM
                const displayHour = i === 12 ? 12 : hour;

                const startTime = `${displayHour}:00 ${period}`;

                // Calculate end time
                const endH = i + 1;
                const endPeriod = endH >= 12 && endH < 24 ? 'PM' : 'AM'; // 24 is 12 AM next day
                const displayEndHour = endH > 12 ? endH - 12 : endH === 12 || endH === 24 ? 12 : endH;
                const endTime = `${displayEndHour}:00 ${endPeriod}`;

                generatedSlots.push({
                    startTime,
                    endTime,
                    isAvailable: !bookedSlots.includes(startTime),
                    isCustomized: false,
                });
            }

            setSchedule({ date: dateStr, slots: generatedSlots });

        } catch (error) {
            console.error('Error fetching slots:', error);
            setError(error instanceof Error ? error.message : 'Failed to load available slots');
            setSchedule(null);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, therapistId]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSlots();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [fetchSlots]);

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

        // Fix: Correctly find slot by startTime which is used as the ID
        const slot = schedule.slots.find((s) => s.startTime === selectedSlot);
        if (!slot) {
            setError('Selected slot is no longer available');
            return;
        }

        if (!slot.isAvailable) {
            setError('This slot has been booked. Please select another.');
            setSelectedSlot(null);
            return;
        }

        const confirmMessage = `Confirm booking for ${therapistName} on ${schedule.date} at ${slot.startTime}?`;
        if (!window.confirm(confirmMessage)) {
            return;
        }

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

            if (!response.ok) {
                throw new Error(result.message || 'Failed to book session');
            }

            alert('Session booked successfully!');
            onSuccess?.(); // Call onSuccess callback
            onClose(); // Close the modal
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error booking session. Please try again.';
            setError(errorMessage);

            if (errorMessage.includes('not available') || errorMessage.includes('already booked')) {
                fetchSlots();
            }
        } finally {
            setBooking(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const slotsForGrid = schedule?.slots.map((slot, index) => ({
        _id: slot.startTime, // Use startTime as unique ID for the slot
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
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>📅 Book Your Appointment</h2>
                        <p className={styles.subtitle}>with {therapistName}</p>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close booking modal"
                    >
                        ✕
                    </button>
                </div>

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
                                <div className={styles.spinner}></div>
                                <p>Loading available slots...</p>
                            </div>
                        ) : error && !loading ? (
                            <div className={styles.errorMessage}>
                                <p>{error}</p>
                                <button
                                    className={styles.retryBtn}
                                    onClick={fetchSlots}
                                >
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

                {error && !loading && (
                    <div className={styles.errorBanner}>
                        <span className={styles.errorIcon}>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className={styles.footer}>
                    <p className={styles.helpText}>
                        Trouble finding a slot? <a href="/support">Let Us Help You ›</a>
                    </p>
                    <button
                        className={styles.bookBtn}
                        disabled={!selectedSlot || booking || loading}
                        onClick={handleBookSession}
                        aria-label="Book selected session"
                    >
                        {booking ? 'Booking...' : 'Book Session'}
                    </button>
                </div>
            </div>
        </div>
    );
}
