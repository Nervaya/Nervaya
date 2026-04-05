'use client';

import React, { useCallback } from 'react';
import { type TimeSlot } from '@/lib/api/schedule';
import { SlotBlock } from '../SlotBlock';
import {
  isSameDay,
  toDateStr,
  HOUR_HEIGHT,
  DAY_START_HOUR,
  DAY_END_HOUR,
  pixelOffsetToTime,
} from '../utils/calendarHelpers';
import styles from './styles.module.css';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const totalHours = DAY_END_HOUR - DAY_START_HOUR;

interface DayColumnProps {
  date: Date;
  dayIndex: number;
  slots: TimeSlot[];
  role: 'admin' | 'therapist';
  onSlotClick: (date: string, slot: TimeSlot) => void;
  onEmptyClick: (date: string, time: string) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({ date, dayIndex, slots, role, onSlotClick, onEmptyClick }) => {
  const dateStr = toDateStr(date);
  const isToday = isSameDay(date, new Date());
  const dayNum = date.getDate();
  const monthShort = date.toLocaleString('en-US', { month: 'short' });

  const handleEmptyClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const time = pixelOffsetToTime(offsetY);
      onEmptyClick(dateStr, time);
    },
    [dateStr, onEmptyClick],
  );

  const handleSlotClick = useCallback(
    (slot: TimeSlot) => {
      onSlotClick(dateStr, slot);
    },
    [dateStr, onSlotClick],
  );

  // Current time line
  const now = new Date();
  let currentTimeTop: number | null = null;
  if (isToday) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const dayStartMinutes = DAY_START_HOUR * 60;
    const dayEndMinutes = DAY_END_HOUR * 60;
    if (currentMinutes >= dayStartMinutes && currentMinutes <= dayEndMinutes) {
      currentTimeTop = ((currentMinutes - dayStartMinutes) / 60) * HOUR_HEIGHT;
    }
  }

  return (
    <div className={styles.column}>
      {/* Day header */}
      <div className={`${styles.dayHeader} ${isToday ? styles.today : ''}`}>
        <span className={styles.dayName}>{DAY_NAMES[dayIndex]}</span>
        <span className={`${styles.dayNum} ${isToday ? styles.todayNum : ''}`}>
          {dayNum === 1 ? `${monthShort} ${dayNum}` : dayNum}
        </span>
      </div>

      {/* Slot grid area */}
      <div
        className={styles.slotsArea}
        style={{ height: totalHours * HOUR_HEIGHT }}
        onClick={handleEmptyClick}
        role="button"
        tabIndex={0}
        aria-label={`Add slot on ${dateStr}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEmptyClick(dateStr, '9:00 AM');
        }}
      >
        {/* Hour grid lines */}
        {Array.from({ length: totalHours + 1 }, (_, i) => (
          <div key={i} className={styles.hourLine} style={{ top: i * HOUR_HEIGHT }} />
        ))}

        {/* Half-hour dashed lines */}
        {Array.from({ length: totalHours }, (_, i) => (
          <div key={`half-${i}`} className={styles.halfHourLine} style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
        ))}

        {/* Current time indicator */}
        {currentTimeTop !== null && (
          <div className={styles.currentTime} style={{ top: currentTimeTop }}>
            <div className={styles.currentTimeDot} />
            <div className={styles.currentTimeLine} />
          </div>
        )}

        {/* Slot blocks */}
        {slots.map((slot) => (
          <SlotBlock
            key={`${slot.startTime}-${slot.endTime}`}
            slot={slot}
            date={dateStr}
            role={role}
            onClick={handleSlotClick}
          />
        ))}
      </div>
    </div>
  );
};
