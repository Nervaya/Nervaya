'use client';

import { useState, useEffect } from 'react';
import { TherapistSlot } from '@/types/session.types';
import TimeSlotGrid from '../TimeSlotGrid';
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
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [slots, setSlots] = useState<TherapistSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        fetchSlots();
    }, [selectedDate]);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await fetch(`/api/therapists/${therapistId}/slots?date=${dateStr}`);
            if (!response.ok) throw new Error('Failed to fetch slots');

            const result = await response.json();
            setSlots(result.data || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookSession = async () => {
        if (!selectedSlot) return;

        const slot = slots.find((s) => s._id === selectedSlot);
        if (!slot) return;

        setBooking(true);
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

            if (!response.ok) throw new Error('Failed to book session');

            alert('Session booked successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Error booking session');
        } finally {
            setBooking(false);
        }
    };

    const navigateMonth = (direction: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedDate(newDate);
        setSelectedSlot(null);
    };

    const navigateDay = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
        setSelectedSlot(null);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
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
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.dateNavigation}>
                    <button onClick={() => navigateMonth(-1)} className={styles.navBtn}>‹</button>
                    <div className={styles.dateDisplay}>{formatDate(selectedDate)}</div>
                    <button onClick={() => navigateMonth(1)} className={styles.navBtn}>›</button>
                </div>

                <div className={styles.dayNavigation}>
                    {[-2, -1, 0, 1, 2].map((offset) => {
                        const date = new Date(selectedDate);
                        date.setDate(date.getDate() + offset);
                        const isSelected = offset === 0;

                        return (
                            <button
                                key={offset}
                                className={`${styles.dayBtn} ${isSelected ? styles.dayBtnActive : ''}`}
                                onClick={() => navigateDay(offset)}
                            >
                                {date.getDate()}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className={styles.loading}>Loading slots...</div>
                ) : (
                    <TimeSlotGrid
                        slots={slots}
                        selectedSlot={selectedSlot}
                        onSlotSelect={(id) => setSelectedSlot(id)}
                    />
                )}

                <div className={styles.footer}>
                    <p className={styles.helpText}>
                        Trouble finding a slot? <a href="/support">Let Us Help You ›</a>
                    </p>
                    <button
                        className={styles.bookBtn}
                        disabled={!selectedSlot || booking}
                        onClick={handleBookSession}
                    >
                        {booking ? 'Booking...' : 'Book Session'}
                    </button>
                </div>
            </div>
        </div>
    );
}
