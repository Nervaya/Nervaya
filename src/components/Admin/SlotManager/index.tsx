'use client';

import { useState, useEffect } from 'react';
import { TherapistSlot } from '@/types/session.types';
import styles from './styles.module.css';

interface SlotManagerProps {
    therapistId: string;
    onSlotUpdate?: () => void;
}

// Helper functions to convert between 24-hour format (HH:MM) and 12-hour format (HH:MM AM/PM)
function convert24To12(time24: string): string {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

function convert12To24(time12: string): string {
    if (!time12) return '';
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return time12; // Return as-is if format doesn't match
    
    let hour = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

export default function SlotManager({ therapistId, onSlotUpdate }: SlotManagerProps) {
    const [slots, setSlots] = useState<TherapistSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingSlot, setEditingSlot] = useState<TherapistSlot | null>(null);
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        isAvailable: true,
    });

    useEffect(() => {
        fetchSlots();
    }, [selectedDate, therapistId]);

    const fetchSlots = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/therapists/${therapistId}/slots?date=${selectedDate}&includeBooked=true`
            );
            if (!response.ok) throw new Error('Failed to fetch slots');

            const result = await response.json();
            setSlots(result.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load slots');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // Convert time format from 24-hour to 12-hour
            const payload = {
                ...formData,
                startTime: convert24To12(formData.startTime),
                endTime: convert24To12(formData.endTime),
            };

            const response = await fetch(`/api/therapists/${therapistId}/slots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create slot');
            }

            setShowCreateForm(false);
            setFormData({ date: '', startTime: '', endTime: '', isAvailable: true });
            fetchSlots();
            onSlotUpdate?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create slot');
        }
    };

    const handleUpdateSlot = async (slotId: string, updates: Partial<TherapistSlot>) => {
        setError(null);

        try {
            const response = await fetch(
                `/api/therapists/${therapistId}/slots?slotId=${slotId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update slot');
            }

            setEditingSlot(null);
            fetchSlots();
            onSlotUpdate?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update slot');
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (!confirm('Are you sure you want to delete this slot?')) {
            return;
        }

        setError(null);

        try {
            const response = await fetch(
                `/api/therapists/${therapistId}/slots?slotId=${slotId}`,
                {
                    method: 'DELETE',
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete slot');
            }

            fetchSlots();
            onSlotUpdate?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete slot');
        }
    };

    const toggleSlotAvailability = (slot: TherapistSlot) => {
        if (!slot.isAvailable && slot.sessionId) {
            alert('Cannot make a booked slot available. Cancel the session first.');
            return;
        }

        handleUpdateSlot(slot._id, { isAvailable: !slot.isAvailable });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Manage Slots</h3>
                <div className={styles.controls}>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={styles.dateInput}
                    />
                    <button
                        className={styles.addButton}
                        onClick={() => {
                            setShowCreateForm(true);
                            setFormData({ ...formData, date: selectedDate });
                        }}
                    >
                        + Add Slot
                    </button>
                </div>
            </div>

            {error && (
                <div className={styles.errorBanner}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {showCreateForm && (
                <div className={styles.formCard}>
                    <h4>Create New Slot</h4>
                    <form onSubmit={handleCreateSlot}>
                        <div className={styles.formRow}>
                            <label>
                                Date
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, date: e.target.value })
                                    }
                                    required
                                    className={styles.input}
                                />
                            </label>
                            <label>
                                Start Time
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, startTime: e.target.value })
                                    }
                                    required
                                    className={styles.input}
                                />
                            </label>
                            <label>
                                End Time
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, endTime: e.target.value })
                                    }
                                    required
                                    className={styles.input}
                                />
                            </label>
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" className={styles.submitButton}>
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setFormData({
                                        date: '',
                                        startTime: '',
                                        endTime: '',
                                        isAvailable: true,
                                    });
                                }}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>Loading slots...</div>
            ) : slots.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No slots found for this date.</p>
                </div>
            ) : (
                <div className={styles.slotsList}>
                    {slots.map((slot) => (
                        <div
                            key={slot._id}
                            className={`${styles.slotCard} ${
                                !slot.isAvailable ? styles.booked : ''
                            } ${slot.isCustomized ? styles.customized : ''}`}
                        >
                            <div className={styles.slotInfo}>
                                <div className={styles.timeInfo}>
                                    <span className={styles.time}>
                                        {slot.startTime} - {slot.endTime}
                                    </span>
                                    {slot.isCustomized && (
                                        <span className={styles.badge}>Custom</span>
                                    )}
                                    {!slot.isAvailable && (
                                        <span className={styles.badgeBooked}>Booked</span>
                                    )}
                                </div>
                                <div className={styles.slotMeta}>
                                    <span>Date: {slot.date}</span>
                                    {slot.sessionId && (
                                        <span>Session ID: {slot.sessionId}</span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.slotActions}>
                                <button
                                    className={styles.toggleButton}
                                    onClick={() => toggleSlotAvailability(slot)}
                                    disabled={!slot.isAvailable && !!slot.sessionId}
                                >
                                    {slot.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                                </button>
                                {slot.isCustomized && (
                                    <>
                                        <button
                                            className={styles.editButton}
                                            onClick={() => setEditingSlot(slot)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteSlot(slot._id)}
                                            disabled={!slot.isAvailable && !!slot.sessionId}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingSlot && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h4>Edit Slot</h4>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const updates = {
                                    ...formData,
                                    startTime: formData.startTime 
                                        ? convert24To12(formData.startTime)
                                        : editingSlot.startTime,
                                    endTime: formData.endTime
                                        ? convert24To12(formData.endTime)
                                        : editingSlot.endTime,
                                };
                                handleUpdateSlot(editingSlot._id, updates);
                            }}
                        >
                            <div className={styles.formRow}>
                                <label>
                                    Date
                                    <input
                                        type="date"
                                        value={formData.date || editingSlot.date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, date: e.target.value })
                                        }
                                        required
                                        className={styles.input}
                                    />
                                </label>
                                <label>
                                    Start Time
                                    <input
                                        type="time"
                                        value={formData.startTime || convert12To24(editingSlot.startTime)}
                                        onChange={(e) =>
                                            setFormData({ ...formData, startTime: e.target.value })
                                        }
                                        required
                                        className={styles.input}
                                    />
                                </label>
                                <label>
                                    End Time
                                    <input
                                        type="time"
                                        value={formData.endTime || convert12To24(editingSlot.endTime)}
                                        onChange={(e) =>
                                            setFormData({ ...formData, endTime: e.target.value })
                                        }
                                        required
                                        className={styles.input}
                                    />
                                </label>
                            </div>
                            <div className={styles.formActions}>
                                <button type="submit" className={styles.submitButton}>
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingSlot(null);
                                        setFormData({
                                            date: '',
                                            startTime: '',
                                            endTime: '',
                                            isAvailable: true,
                                        });
                                    }}
                                    className={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
