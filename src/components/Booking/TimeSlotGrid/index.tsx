'use client';

import { TherapistSlot } from '@/types/session.types';
import styles from './styles.module.css';

interface TimeSlotGridProps {
  slots: TherapistSlot[];
  selectedSlot: string | null;
  onSlotSelect: (slotId: string, startTime?: string) => void;
}

type TimePeriod = 'Morning' | 'Afternoon' | 'Evening';

interface GroupedSlots {
  period: TimePeriod;
  slots: TherapistSlot[];
}

function getTimePeriod(time: string): TimePeriod {
  const hour = parseInt(time.split(':')[0]);
  const isPM = time.includes('PM');
  const hour24 =
    isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;

  if (hour24 < 12) {
    return 'Morning';
  }
  if (hour24 < 17) {
    return 'Afternoon';
  }
  return 'Evening';
}

function groupSlotsByPeriod(slots: TherapistSlot[]): GroupedSlots[] {
  const grouped: Record<TimePeriod, TherapistSlot[]> = {
    Morning: [],
    Afternoon: [],
    Evening: [],
  };

  slots.forEach((slot) => {
    const period = getTimePeriod(slot.startTime);
    grouped[period].push(slot);
  });

  const periods: TimePeriod[] = ['Morning', 'Afternoon', 'Evening'];
  const result: GroupedSlots[] = periods
    .map((period) => ({
      period,
      slots: grouped[period],
    }))
    .filter((group) => group.slots.length > 0);

  return result;
}

export default function TimeSlotGrid({
  slots,
  selectedSlot,
  onSlotSelect,
}: TimeSlotGridProps) {
  if (slots.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No slots available for this date.</p>
          <p className={styles.emptySubtext}>
            Please select another date or contact support.
          </p>
        </div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByPeriod(slots);

  return (
    <div className={styles.container}>
      <div className={styles.slotsList}>
        {groupedSlots.map((group) => (
          <div key={group.period} className={styles.periodGroup}>
            <h4 className={styles.periodTitle}>
              <span className={styles.periodIcon}>
                {group.period === 'Morning' && '🌅'}
                {group.period === 'Afternoon' && '☀️'}
                {group.period === 'Evening' && '🌆'}
              </span>
              {group.period}
              <span className={styles.periodCount}>
                ({group.slots.filter((s) => s.isAvailable).length} available)
              </span>
            </h4>
            <div className={styles.grid}>
              {group.slots.map((slot) => {
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
                    onClick={() => onSlotSelect(slot._id)}
                    disabled={isBooked}
                    aria-label={`Select ${slot.startTime} to ${slot.endTime}`}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.time}>{slot.startTime}</span>
                    {slot.endTime && (
                      <span className={styles.timeRange}>{slot.endTime}</span>
                    )}
                    {isCustomized && (
                      <span
                        className={styles.customizedBadge}
                        title="Customized slot"
                      >
                        ⭐
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
