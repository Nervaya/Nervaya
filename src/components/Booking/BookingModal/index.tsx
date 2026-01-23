'use client';

import { useState, useEffect, useCallback } from 'react';
import { TherapistSlot } from '@/types/session.types';
import TimeSlotGrid from '../TimeSlotGrid';
import DatePicker from '../DatePicker';
import styles from './styles.module.css';

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
    
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [slots, setSlots] = useState<TherapistSlot[]>([]);
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
            const response = await fetch(`/api/therapists/${therapistId}/slots?date=${dateStr}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch slots');
            }

            const result = await response.json();
            setSlots(result.data || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
            setError(error instanceof Error ? error.message : 'Failed to load available slots');
            setSlots([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, therapistId]);

    // Debounce slot fetching
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
        
        // Prevent booking past dates
        if (dateOnly < todayOnly) {
            setError('Cannot book sessions in the past');
            return;
        }
        
        setSelectedDate(date);
        setSelectedSlot(null);
        setError(null);
    };

    const handleBookSession = async () => {
        if (!selectedSlot) {
            setError('Please select a time slot');
            return;
        }

        const slot = slots.find((s) => s._id === selectedSlot);
        if (!slot) {
            setError('Selected slot is no longer available');
            return;
        }

        // Double-check slot availability
        if (!slot.isAvailable) {
            setError('This slot has been booked. Please select another.');
            setSelectedSlot(null);
            return;
        }

        // Confirm booking
        const confirmMessage = `Confirm booking for ${therapistName} on ${slot.date} at ${slot.startTime}?`;
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
                    date: slot.date,
                    startTime: slot.startTime,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to book session');
            }

            // Success feedback
            alert('Session booked successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Error booking session. Please try again.';
            setError(errorMessage);
            
            // If slot was already booked, refresh slots
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
                                slots={slots}
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
