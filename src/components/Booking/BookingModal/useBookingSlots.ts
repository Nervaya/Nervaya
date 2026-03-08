import { useState, useEffect, useCallback } from 'react';
import { scheduleApi } from '@/lib/api/schedule';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isCustomized: boolean;
  sessionId?: string;
}

export interface Schedule {
  date: string;
  slots: TimeSlot[];
}

export function useBookingSlots(therapistId: string, selectedDate: Date, visibleMonth?: Date) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(new Set());
  const [slotAvailability, setSlotAvailability] = useState<Map<string, number>>(new Map());

  const fetchSlots = useCallback(async () => {
    if (!therapistId) return;

    setLoading(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const result = await scheduleApi.getByDate(therapistId, dateStr);
      const apiSlots = result.data?.slots;
      const apiDate = result.data?.date;
      if (apiDate !== undefined && Array.isArray(apiSlots)) {
        const slots: TimeSlot[] = apiSlots.map(
          (slot: { startTime: string; endTime: string; isAvailable: boolean; isCustomized?: boolean }) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable,
            isCustomized: slot.isCustomized ?? false,
          }),
        );
        setSchedule({ date: apiDate, slots });
      } else {
        setSchedule({ date: dateStr, slots: [] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load available slots');
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  }, [therapistId, selectedDate]);

  const fetchDateAvailability = useCallback(
    async (monthStart: Date) => {
      if (!therapistId) return;

      const year = monthStart.getFullYear();
      const month = monthStart.getMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      try {
        const result = await scheduleApi.getByDateRange(therapistId, startDate, endDate);
        const schedules = result.data as Array<{ date: string; slots: Array<{ isAvailable: boolean }> }> | undefined;
        if (!Array.isArray(schedules)) return;

        const booked = new Set<string>();
        const scheduleDates = new Set<string>();
        const availabilityMap = new Map<string, number>();

        for (const s of schedules) {
          scheduleDates.add(s.date);
          const availableCount = s.slots?.filter((slot) => slot.isAvailable).length ?? 0;
          availabilityMap.set(s.date, availableCount);

          const hasAvailable = s.slots?.some((slot) => slot.isAvailable) ?? false;
          if (!hasAvailable) booked.add(s.date);
        }

        for (let d = 1; d <= lastDay; d++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          if (!scheduleDates.has(dateStr)) {
            booked.add(dateStr);
            availabilityMap.set(dateStr, 0);
          }
        }

        setFullyBookedDates(booked);
        setSlotAvailability(availabilityMap);
      } catch {
        setFullyBookedDates(new Set());
        setSlotAvailability(new Map());
      }
    },
    [therapistId],
  );

  useEffect(() => {
    const timeoutId = setTimeout(fetchSlots, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchSlots]);

  useEffect(() => {
    const month = visibleMonth ?? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    fetchDateAvailability(month);
  }, [fetchDateAvailability, visibleMonth, selectedDate]);

  if (!therapistId) {
    console.error('useBookingSlots: therapistId is required');
    setError('Therapist ID is required');
    return { schedule, loading, error, fetchSlots: () => {}, fullyBookedDates, slotAvailability };
  }

  return { schedule, loading, error, fetchSlots, fullyBookedDates, fetchDateAvailability, slotAvailability };
}
