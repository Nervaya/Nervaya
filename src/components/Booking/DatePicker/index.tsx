'use client';

import { useState, useEffect } from 'react';
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

    // Sync currentMonth when selectedDate changes
    useEffect(() => {
        setCurrentMonth(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        );
    }, [selectedDate]);

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
        const newMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + direction,
            1
        );
        
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

    const navigateYear = (direction: number) => {
        const newYear = currentMonth.getFullYear() + direction;
        const newMonth = new Date(
            newYear,
            currentMonth.getMonth(),
            1
        );
        
        // Check if the new date would be disabled due to minDate
        if (minDate && newMonth < minDate) {
            // If going to previous year would be before minDate, go to minDate instead
            const minDateYear = minDate.getFullYear();
            const minDateMonth = minDate.getMonth();
            setCurrentMonth(new Date(minDateYear, minDateMonth, 1));
            return;
        }
        
        // Check if the new date would be disabled due to maxDate
        if (maxDate && newMonth > maxDate) {
            // If going to next year would be after maxDate, go to maxDate instead
            const maxDateYear = maxDate.getFullYear();
            const maxDateMonth = maxDate.getMonth();
            setCurrentMonth(new Date(maxDateYear, maxDateMonth, 1));
            return;
        }
        
        setCurrentMonth(newMonth);
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
                        onClick={() => navigateMonth(-1)}
                        aria-label="Previous month"
                        disabled={minDate && currentMonth <= new Date(minDate.getFullYear(), minDate.getMonth(), 1)}
                    >
                        ‹
                    </button>
                </div>
                
                <div className={styles.monthYear}>
                    <div className={styles.monthDisplay}>
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
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
