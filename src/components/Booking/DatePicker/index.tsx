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
}

export default function DatePicker({ selectedDate, onDateSelect, minDate = new Date(), maxDate }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  useEffect(() => {
    setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const isDateDisabled = (date: Date) => checkDateDisabled(date, minDate, maxDate);
  const isSelected = (date: Date) => isSameDay(date, selectedDate);
  const isToday = (date: Date) => isSameDay(date, today);

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);

    // Check if the new date would be disabled due to minDate
    if (minDate && newMonth < minDate) {
      const minDateYear = minDate.getFullYear();
      const minDateMonth = minDate.getMonth();
      setCurrentMonth(new Date(minDateYear, minDateMonth, 1));
      return;
    }

    // Check if the new date would be disabled due to maxDate
    if (maxDate && newMonth > maxDate) {
      const maxDateYear = maxDate.getFullYear();
      const maxDateMonth = maxDate.getMonth();
      setCurrentMonth(new Date(maxDateYear, maxDateMonth, 1));
      return;
    }

    setCurrentMonth(newMonth);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (!isDateDisabled(newDate)) {
      onDateSelect(newDate);
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add all days of the month
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
