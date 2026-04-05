import { useState, useMemo, useCallback } from 'react';
import { getMonday, getWeekDates, formatWeekLabel } from '../utils/calendarHelpers';

export function useWeekNavigation() {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));

  const goNext = useCallback(() => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }, []);

  const goPrev = useCallback(() => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  }, []);

  const goToday = useCallback(() => {
    setWeekStart(getMonday(new Date()));
  }, []);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekLabel = useMemo(() => formatWeekLabel(weekStart), [weekStart]);

  return { weekStart, setWeekStart, weekDates, weekLabel, goNext, goPrev, goToday };
}
