'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import {
  MONTH_NAMES,
  DAY_NAMES,
  isSameDay,
  isDateDisabled as checkDateDisabled,
  getDaysInMonth,
  getFirstDayOfMonth,
} from './datePickerUtils';

interface DatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  fullyBookedDates?: Set<string>;
  onMonthChange?: (monthStart: Date) => void;
}

export default function DatePicker({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
  fullyBookedDates,
  onMonthChange,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  useEffect(() => {
    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    setCurrentMonth(monthStart);
    onMonthChange?.(monthStart);
  }, [selectedDate, onMonthChange]);

  const isDateDisabled = (date: Date) => checkDateDisabled(date, minDate, maxDate, fullyBookedDates);
  const isSelected = (date: Date) => isSameDay(date, selectedDate);
  const isToday = (date: Date) => isSameDay(date, today);

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);

    if (minDate && newMonth < minDate) {
      const minDateYear = minDate.getFullYear();
      const minDateMonth = minDate.getMonth();
      const target = new Date(minDateYear, minDateMonth, 1);
      setCurrentMonth(target);
      onMonthChange?.(target);
      return;
    }

    if (maxDate && newMonth > maxDate) {
      const maxDateYear = maxDate.getFullYear();
      const maxDateMonth = maxDate.getMonth();
      const target = new Date(maxDateYear, maxDateMonth, 1);
      setCurrentMonth(target);
      onMonthChange?.(target);
      return;
    }

    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (!isDateDisabled(newDate)) {
      onDateSelect(newDate);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className={styles.datePicker}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
            disabled={minDate && currentMonth <= new Date(minDate.getFullYear(), minDate.getMonth(), 1)}
          >
            ‹
          </button>
        </div>

        <div className={styles.monthYear}>
          <div className={styles.monthDisplay}>
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
        </div>

        <div className={styles.navigation}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => navigateMonth(1)}
            aria-label="Next month"
            disabled={maxDate && currentMonth >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)}
          >
            ›
          </button>
        </div>
      </div>

      <div className={styles.calendar}>
        <div className={styles.dayNames}>
          {DAY_NAMES.map((day) => (
            <div key={day} className={styles.dayName}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.days}>
          {days.map((day, index) => {
            if (day === null) {
              const emptyKey = `empty-${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${firstDay + index}`;
              return <div key={emptyKey} className={styles.dayEmpty} />;
            }

            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const disabled = isDateDisabled(date);
            const isSelectedDate = isSelected(date);
            const isTodayDate = isToday(date);

            return (
              <button
                key={day}
                type="button"
                className={`${styles.day} ${
                  isSelectedDate ? styles.daySelected : ''
                } ${isTodayDate ? styles.dayToday : ''} ${disabled ? styles.dayDisabled : ''}`}
                onClick={() => handleDateClick(day)}
                disabled={disabled}
                aria-label={`Select ${date.toLocaleDateString()}`}
                aria-pressed={isSelectedDate}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
