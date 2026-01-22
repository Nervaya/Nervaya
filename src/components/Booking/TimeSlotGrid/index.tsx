'use client';

import { TherapistSlot } from '@/types/session.types';
import styles from './styles.module.css';

interface TimeSlotGridProps {
    slots: TherapistSlot[];
    selectedSlot: string | null;
    onSlotSelect: (slotId: string, startTime: string) => void;
}

export default function TimeSlotGrid({
    slots,
    selectedSlot,
    onSlotSelect,
}: TimeSlotGridProps) {
    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>
                🕐 Available Time Slots
            </h3>
            <div className={styles.grid}>
                {slots.map((slot) => {
                    const isSelected = selectedSlot === slot._id;
                    const isBooked = !slot.isAvailable;
                    const isCustomized = slot.isCustomized;

                    let slotClassName = styles.slot;
                    if (isBooked) {
                        slotClassName += ` ${styles.booked}`;
                    } else if (isSelected) {
                        slotClassName += ` ${styles.selected}`;
                    } else if (isCustomized) {
                        slotClassName += ` ${styles.customized}`;
                    }

                    return (
                        <button
                            key={slot._id}
                            className={slotClassName}
                            onClick={() => onSlotSelect(slot._id, slot.startTime)}
                            disabled={isBooked}
                        >
                            {slot.startTime}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
