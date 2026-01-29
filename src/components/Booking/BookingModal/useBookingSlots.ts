import { useState, useEffect, useCallback } from 'react';

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

function generateSlotsForDay(bookedSlots: string[]): TimeSlot[] {
  const generatedSlots: TimeSlot[] = [];
  for (let i = 9; i <= 18; i++) {
    const hour = i > 12 ? i - 12 : i;
    const period = i >= 12 ? 'PM' : 'AM';
    const displayHour = i === 12 ? 12 : hour;
    const startTime = `${displayHour}:00 ${period}`;
    const endH = i + 1;
    const endPeriod = endH >= 12 && endH < 24 ? 'PM' : 'AM';
    const displayEndHour = endH > 12 ? endH - 12 : endH === 12 || endH === 24 ? 12 : endH;
    const endTime = `${displayEndHour}:00 ${endPeriod}`;
    generatedSlots.push({
      startTime,
      endTime,
      isAvailable: !bookedSlots.includes(startTime),
      isCustomized: false,
    });
  }
  return generatedSlots;
}

export function useBookingSlots(therapistId: string, selectedDate: Date) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/therapists/${therapistId}/schedule?date=${dateStr}&includeBooked=true`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch slots');
      }
      const result = await response.json();
      const bookedSlots = result.data?.bookedSlots || [];
      const slots = generateSlotsForDay(bookedSlots);
      setSchedule({ date: dateStr, slots });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load available slots');
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  }, [therapistId, selectedDate]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchSlots, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchSlots]);

  return { schedule, loading, error, fetchSlots };
}
