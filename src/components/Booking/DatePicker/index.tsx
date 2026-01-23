'use client';

import { useState } from 'react';
import styles from './styles.module.css';

interface DatePickerProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
}

export default function DatePicker({
    selectedDate,
    onDateSelect,
    minDate = new Date(),
    maxDate,
}: DatePickerProps) {
    const [currentMonth, setCurrentMonth] = useState(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isDateDisabled = (date: Date): boolean => {
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);
        
        if (minDate) {
            const minDateOnly = new Date(minDate);
            minDateOnly.setHours(0, 0, 0, 0);
            if (dateOnly < minDateOnly) return true;
        }
        
        if (maxDate) {
            const maxDateOnly = new Date(maxDate);
            maxDateOnly.setHours(0, 0, 0, 0);
            if (dateOnly > maxDateOnly) return true;
        }
        
        return false;
    };

    const isSameDay = (date1: Date, date2: Date): boolean => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const isToday = (date: Date): boolean => {
        return isSameDay(date, today);
    };

    const isSelected = (date: Date): boolean => {
        return isSameDay(date, selectedDate);
    };

    const navigateMonth = (direction: number) => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + direction,
                1
            )
        );
    };

    const navigateYear = (direction: number) => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear() + direction,
                currentMonth.getMonth(),
                1
            )
        );
    };

    const getDaysInMonth = (date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        
        if (!isDateDisabled(newDate)) {
            onDateSelect(newDate);
        }
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
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
                        onClick={() => navigateYear(-1)}
                        aria-label="Previous year"
                    >
                        ‹‹
                    </button>
                    <button
                        type="button"
                        className={styles.navButton}
                        onClick={() => navigateMonth(-1)}
                        aria-label="Previous month"
                    >
                        ‹
                    </button>
                </div>
                
                <div className={styles.monthYear}>
                    <select
                        value={currentMonth.getMonth()}
                        onChange={(e) => {
                            setCurrentMonth(
                                new Date(
                                    currentMonth.getFullYear(),
                                    parseInt(e.target.value),
                                    1
                                )
                            );
                        }}
                        className={styles.monthSelect}
                    >
                        {monthNames.map((month, index) => (
                            <option key={month} value={index}>
                                {month}
                            </option>
                        ))}
                    </select>
                    <select
                        value={currentMonth.getFullYear()}
                        onChange={(e) => {
                            setCurrentMonth(
                                new Date(
                                    parseInt(e.target.value),
                                    currentMonth.getMonth(),
                                    1
                                )
                            );
                        }}
                        className={styles.yearSelect}
                    >
                        {Array.from({ length: 10 }, (_, i) => {
                            const year = today.getFullYear() + i;
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className={styles.navigation}>
                    <button
                        type="button"
                        className={styles.navButton}
                        onClick={() => navigateMonth(1)}
                        aria-label="Next month"
                    >
                        ›
                    </button>
                    <button
                        type="button"
                        className={styles.navButton}
                        onClick={() => navigateYear(1)}
                        aria-label="Next year"
                    >
                        ››
                    </button>
                </div>
            </div>

            <div className={styles.calendar}>
                <div className={styles.dayNames}>
                    {dayNames.map((day) => (
                        <div key={day} className={styles.dayName}>
                            {day}
                        </div>
                    ))}
                </div>

                <div className={styles.days}>
                    {days.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className={styles.dayEmpty} />;
                        }

                        const date = new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth(),
                            day
                        );
                        const disabled = isDateDisabled(date);
                        const isSelectedDate = isSelected(date);
                        const isTodayDate = isToday(date);

                        return (
                            <button
                                key={day}
                                type="button"
                                className={`${styles.day} ${
                                    isSelectedDate ? styles.daySelected : ''
                                } ${isTodayDate ? styles.dayToday : ''} ${
                                    disabled ? styles.dayDisabled : ''
                                }`}
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
