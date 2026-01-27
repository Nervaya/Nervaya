"use client";

import { useState, useEffect, useCallback } from "react";
import DatePicker from "@/components/Booking/DatePicker";
import styles from "./styles.module.css";

interface Schedule {
  date: string;
  slots: Array<{
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
}

interface SlotManagerProps {
  therapistId: string;
  onSlotUpdate?: () => void;
}

export default function SlotManager({ therapistId }: SlotManagerProps) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [weekSchedules, setWeekSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await fetch(
        `/api/therapists/${therapistId}/schedule?date=${dateStr}&includeBooked=true`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }

      const result = await response.json();
      if (result.data && result.data.slots) {
        setSchedule(result.data);
      } else {
        setSchedule({ date: dateStr, slots: [] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedule");
      setSchedule({
        date: selectedDate.toISOString().split("T")[0],
        slots: [],
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, therapistId]);

  const fetchWeekSchedules = useCallback(async () => {
    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const response = await fetch(
        `/api/therapists/${therapistId}/schedule?startDate=${startDateStr}&endDate=${endDateStr}&includeBooked=true`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch week schedules");
      }

      const result = await response.json();
      setWeekSchedules(result.data || []);
    } catch (_err) {
      setWeekSchedules([]);
    }
  }, [selectedDate, therapistId]);

  useEffect(() => {
    fetchSchedule();
    fetchWeekSchedules();
  }, [fetchSchedule, fetchWeekSchedules]);

  const getSlotsForDate = (date: Date): Schedule["slots"] => {
    const dateStr = date.toISOString().split("T")[0];
    const scheduleForDate = weekSchedules.find((s) => s.date === dateStr);
    return scheduleForDate?.slots || [];
  };

  const getSlotsForDay = (dayOfWeek: number): Schedule["slots"] => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayOfWeek);
    return getSlotsForDate(targetDate);
  };

  const bookedCount = schedule?.slots.filter((s) => !s.isAvailable).length || 0;
  const totalSlots = schedule?.slots.length || 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Slot Overview</h2>
        <p className={styles.subtitle}>View booked slots for this therapist</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.calendarView}>
        <div className={styles.topRow}>
          <div className={styles.calendarSection}>
            <h3 className={styles.sectionTitle}>Select Date</h3>
            <DatePicker
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              minDate={new Date()}
            />
          </div>

          <div className={styles.slotsRight}>
            <h3 className={styles.sectionTitle}>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>

            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <div className={styles.statsContainer}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{totalSlots}</div>
                  <div className={styles.statLabel}>Total Slots</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{bookedCount}</div>
                  <div className={styles.statLabel}>Booked</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {totalSlots - bookedCount}
                  </div>
                  <div className={styles.statLabel}>Available</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.weekView}>
          <h3 className={styles.sectionTitle}>Week Overview</h3>
          <div className={styles.weekGrid}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, index) => {
                const daySlots = getSlotsForDay(index);
                const bookedCount = daySlots.filter(
                  (s) => !s.isAvailable,
                ).length;
                const totalCount = daySlots.length;

                return (
                  <div key={day} className={styles.weekDay}>
                    <div className={styles.weekDayName}>{day}</div>
                    <div className={styles.weekDayStats}>
                      <span className={styles.totalSlots}>
                        {totalCount} slots
                      </span>
                      <span className={styles.bookedSlots}>
                        {bookedCount} booked
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
