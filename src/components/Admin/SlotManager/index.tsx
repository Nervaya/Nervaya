'use client';

import { useState, useEffect, useCallback } from 'react';
import DatePicker from '@/components/Booking/DatePicker';
import { Dropdown } from '@/components/common';
import styles from './styles.module.css';
import { FaCalendarDays, FaCircleCheck, FaClock, FaCalendarXmark, FaPlus } from 'react-icons/fa6';

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

const TIME_OPTIONS = [
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
].map((t) => ({ value: t, label: t }));

export default function SlotManager({ therapistId, onSlotUpdate }: SlotManagerProps) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [weekSchedules, setWeekSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [addSlotOpen, setAddSlotOpen] = useState(false);
  const [addStartTime, setAddStartTime] = useState('9:00 AM');
  const [addEndTime, setAddEndTime] = useState('10:00 AM');
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/therapists/${therapistId}/schedule?date=${dateStr}&includeBooked=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }

      const result = await response.json();
      if (result.data && result.data.slots) {
        setSchedule(result.data);
      } else {
        setSchedule({ date: dateStr, slots: [] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
      setSchedule({
        date: selectedDate.toISOString().split('T')[0],
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

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `/api/therapists/${therapistId}/schedule?startDate=${startDateStr}&endDate=${endDateStr}&includeBooked=true`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch week schedules');
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

  const getSlotsForDay = (dayOfWeek: number): Schedule['slots'] => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayOfWeek);
    const dateStr = targetDate.toISOString().split('T')[0];
    const scheduleForDate = weekSchedules.find((s) => s.date === dateStr);
    return scheduleForDate?.slots || [];
  };

  const getDateForDay = (dayOfWeek: number): Date => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayOfWeek);
    return targetDate;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const bookedCount = schedule?.slots.filter((s) => !s.isAvailable).length || 0;
  const availableCount = schedule?.slots.filter((s) => s.isAvailable).length || 0;
  const totalSlots = schedule?.slots.length || 0;
  const bookingPercentage = totalSlots > 0 ? Math.round((bookedCount / totalSlots) * 100) : 0;

  const formatTime = (time: string) => {
    if (/AM|PM/i.test(time)) return time;
    const parts = time.split(':');
    const hour = parseInt(parts[0], 10);
    const min = parts[1] || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${min} ${ampm}`;
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const startMins = timeToMins(addStartTime);
    const endMins = timeToMins(addEndTime);
    if (endMins <= startMins) {
      setAddError('End time must be after start time');
      return;
    }
    setAddSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/therapists/${therapistId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          startTime: addStartTime,
          endTime: addEndTime,
          isAvailable: true,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to add slot');
      setAddSlotOpen(false);
      setAddStartTime('9:00 AM');
      setAddEndTime('10:00 AM');
      fetchSchedule();
      fetchWeekSchedules();
      onSlotUpdate?.();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add slot');
    } finally {
      setAddSubmitting(false);
    }
  };

  function timeToMins(time12: string): number {
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let hour = parseInt(match[1], 10);
    const min = parseInt(match[2], 10);
    const ampm = (match[3] || '').toUpperCase();
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return hour * 60 + min;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Slot Overview</h2>
          <p className={styles.subtitle}>View and manage booking slots for this therapist</p>
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendAvailable}`} />
            <span>Available</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendBooked}`} />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <FaCalendarXmark />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.calendarView}>
        <div className={styles.topRow}>
          <div className={styles.calendarSection}>
            <h3 className={styles.sectionTitle}>
              <FaCalendarDays className={styles.sectionIcon} />
              Select Date
            </h3>
            <DatePicker selectedDate={selectedDate} onDateSelect={setSelectedDate} minDate={new Date()} />
          </div>

          <div className={styles.slotsRight}>
            <div className={styles.slotsRightHeader}>
              <h3 className={styles.sectionTitle}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <button
                type="button"
                className={styles.addSlotButton}
                onClick={() => {
                  setAddError(null);
                  setAddSlotOpen(true);
                }}
              >
                <FaPlus />
                Add Slot
              </button>
            </div>

            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <>
                <div className={styles.statsContainer}>
                  <div className={`${styles.statCard} ${styles.statTotal}`}>
                    <div className={styles.statIcon}>
                      <FaCalendarDays />
                    </div>
                    <div className={styles.statInfo}>
                      <div className={styles.statValue}>{totalSlots}</div>
                      <div className={styles.statLabel}>Total Slots</div>
                    </div>
                  </div>
                  <div className={`${styles.statCard} ${styles.statBooked}`}>
                    <div className={styles.statIcon}>
                      <FaCircleCheck />
                    </div>
                    <div className={styles.statInfo}>
                      <div className={styles.statValue}>{bookedCount}</div>
                      <div className={styles.statLabel}>Booked</div>
                    </div>
                  </div>
                  <div className={`${styles.statCard} ${styles.statAvailable}`}>
                    <div className={styles.statIcon}>
                      <FaClock />
                    </div>
                    <div className={styles.statInfo}>
                      <div className={styles.statValue}>{availableCount}</div>
                      <div className={styles.statLabel}>Available</div>
                    </div>
                  </div>
                </div>

                {totalSlots > 0 && (
                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>Booking Rate</span>
                      <span className={styles.progressPercent}>{bookingPercentage}%</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${bookingPercentage}%` }} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {!loading && schedule && schedule.slots.length > 0 && (
          <div className={styles.timeSlotsSection}>
            <h3 className={styles.sectionTitle}>
              <FaClock className={styles.sectionIcon} />
              Time Slots
            </h3>
            <div className={styles.timeSlotsGrid}>
              {schedule.slots.map((slot) => (
                <div
                  key={`${slot.startTime}-${slot.endTime}`}
                  className={`${styles.timeSlot} ${slot.isAvailable ? styles.slotAvailable : styles.slotBooked}`}
                >
                  <span className={styles.slotTime}>
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                  <span className={styles.slotStatus}>{slot.isAvailable ? 'Available' : 'Booked'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && (!schedule || schedule.slots.length === 0) && (
          <div className={styles.emptySlots}>
            <FaCalendarXmark className={styles.emptyIcon} />
            <p>No slots configured for this date</p>
            <span className={styles.emptyHint}>Set up consulting hours to create available slots</span>
          </div>
        )}

        <div className={styles.weekView}>
          <h3 className={styles.sectionTitle}>Week Overview</h3>
          <div className={styles.weekGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
              const daySlots = getSlotsForDay(index);
              const dayBooked = daySlots.filter((s) => !s.isAvailable).length;
              const dayTotal = daySlots.length;
              const dayDate = getDateForDay(index);
              const isTodayDay = isToday(dayDate);
              const dayPercent = dayTotal > 0 ? Math.round((dayBooked / dayTotal) * 100) : 0;

              return (
                <div key={day} className={`${styles.weekDay} ${isTodayDay ? styles.weekDayToday : ''}`}>
                  <div className={styles.weekDayHeader}>
                    <span className={styles.weekDayName}>{day}</span>
                    <span className={styles.weekDayDate}>{dayDate.getDate()}</span>
                  </div>
                  {dayTotal > 0 ? (
                    <>
                      <div className={styles.weekDayStats}>
                        <div className={styles.weekDayStat}>
                          <span className={styles.weekStatValue}>{dayTotal}</span>
                          <span className={styles.weekStatLabel}>slots</span>
                        </div>
                        <div className={styles.weekDayStat}>
                          <span className={`${styles.weekStatValue} ${styles.weekStatBooked}`}>{dayBooked}</span>
                          <span className={styles.weekStatLabel}>booked</span>
                        </div>
                      </div>
                      <div className={styles.weekDayProgress}>
                        <div className={styles.weekProgressTrack}>
                          <div className={styles.weekProgressFill} style={{ width: `${dayPercent}%` }} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={styles.weekDayEmpty}>No slots</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {addSlotOpen && (
        <div className={styles.modalOverlay} onClick={() => !addSubmitting && setAddSlotOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Add Slot</h3>
            <p className={styles.modalDate}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <form onSubmit={handleAddSlot} className={styles.addSlotForm}>
              {addError && <div className={styles.addSlotError}>{addError}</div>}
              <div className={styles.addSlotRow}>
                <label className={styles.addSlotLabel} htmlFor="startTime">
                  Start Time
                </label>
                <Dropdown
                  id="startTime"
                  options={TIME_OPTIONS}
                  value={addStartTime}
                  onChange={setAddStartTime}
                  ariaLabel="Start time"
                  className={styles.addSlotSelect}
                />
              </div>
              <div className={styles.addSlotRow}>
                <label className={styles.addSlotLabel} htmlFor="endTime">
                  End Time
                </label>
                <Dropdown
                  id="endTime"
                  options={TIME_OPTIONS}
                  value={addEndTime}
                  onChange={setAddEndTime}
                  ariaLabel="End time"
                  className={styles.addSlotSelect}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancel}
                  onClick={() => setAddSlotOpen(false)}
                  disabled={addSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.modalSubmit} disabled={addSubmitting}>
                  {addSubmitting ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
