'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConsultingHour } from '@/types/therapist.types';
import styles from './styles.module.css';

interface ConsultingHoursManagerProps {
  therapistId: string;
  onUpdate?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const WEEKDAYS = [1, 2, 3, 4, 5];

function convert24To12(time24: string): string {
  if (!time24) {
    return '';
  }
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

function convert12To24(time12: string): string {
  if (!time12) {
    return '';
  }
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    return time12;
  }

  let hour = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hour !== 12) {
    hour += 12;
  }
  if (ampm === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

export default function ConsultingHoursManager({
  therapistId,
  onUpdate,
}: ConsultingHoursManagerProps) {
  const [consultingHours, setConsultingHours] = useState<ConsultingHour[]>([]);
  const [savedHours, setSavedHours] = useState<ConsultingHour[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const fetchConsultingHours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/therapists/${therapistId}/consulting-hours`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch consulting hours');
      }

      const result = await response.json();
      if (result.success) {
        if (!result.data || result.data.length === 0) {
          const defaultHours: ConsultingHour[] = DAYS_OF_WEEK.map((day) => ({
            dayOfWeek: day.value,
            startTime: '09:00 AM',
            endTime: '05:00 PM',
            isEnabled: false,
          }));
          setConsultingHours(defaultHours);
          setSavedHours([]);
        } else {
          const hoursMap = new Map<number, ConsultingHour>(
            result.data.map((h: ConsultingHour) => [h.dayOfWeek, h]),
          );
          const allHours: ConsultingHour[] = DAYS_OF_WEEK.map(
            (day): ConsultingHour => {
              const existing = hoursMap.get(day.value);
              if (existing) {
                return existing;
              }
              return {
                dayOfWeek: day.value,
                startTime: '09:00 AM',
                endTime: '05:00 PM',
                isEnabled: false,
              };
            },
          );
          setConsultingHours(allHours);
          setSavedHours(result.data);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load consulting hours',
      );
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    fetchConsultingHours();
  }, [fetchConsultingHours]);

  const handleUpdate = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    setGenerationStatus(null);

    try {
      const validHours = consultingHours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        startTime: hour.isEnabled ? hour.startTime : '09:00 AM',
        endTime: hour.isEnabled ? hour.endTime : '05:00 PM',
        isEnabled: hour.isEnabled,
      }));

      const response = await fetch(
        `/api/therapists/${therapistId}/consulting-hours`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consultingHours: validHours }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update consulting hours');
      }

      setSuccess('Consulting hours saved successfully!');
      setSavedHours(validHours);
      await fetchConsultingHours();
      onUpdate?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update consulting hours',
      );
    } finally {
      setSaving(false);
    }
  };

  const generateSlots = async (days: number = 30) => {
    setGenerating(true);
    setGenerationStatus(`Generating slots for the next ${days} days...`);
    try {
      const response = await fetch(
        `/api/therapists/${therapistId}/schedule/generate?days=${days}`,
        {
          method: 'POST',
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate slots');
      }
      const inserted = result.data?.insertedCount || 0;
      const modified = result.data?.modifiedCount || 0;
      setGenerationStatus(
        `Successfully generated schedules! (${inserted} new, ${modified} updated)`,
      );
      setTimeout(() => {
        onUpdate?.();
      }, 500);
    } catch (err) {
      setGenerationStatus(
        `Warning: ${err instanceof Error ? err.message : 'Failed to generate slots'}`,
      );
    } finally {
      setGenerating(false);
    }
  };

  const updateDayHours = (
    dayOfWeek: number,
    updates: Partial<ConsultingHour>,
  ) => {
    setConsultingHours((prev) =>
      prev.map((hour) =>
        hour.dayOfWeek === dayOfWeek ? { ...hour, ...updates } : hour,
      ),
    );
  };

  const toggleDay = (dayOfWeek: number) => {
    updateDayHours(dayOfWeek, {
      isEnabled: !consultingHours.find((h) => h.dayOfWeek === dayOfWeek)
        ?.isEnabled,
    });
  };

  const applyToWeekdays = () => {
    const monday = consultingHours.find((h) => h.dayOfWeek === 1);
    if (monday && monday.isEnabled) {
      WEEKDAYS.forEach((day) => {
        updateDayHours(day, {
          isEnabled: true,
          startTime: monday.startTime,
          endTime: monday.endTime,
        });
      });
    }
  };

  const applyToAllDays = () => {
    const firstEnabled = consultingHours.find((h) => h.isEnabled);
    if (firstEnabled) {
      DAYS_OF_WEEK.forEach((day) => {
        updateDayHours(day.value, {
          isEnabled: true,
          startTime: firstEnabled.startTime,
          endTime: firstEnabled.endTime,
        });
      });
    }
  };

  const clearAll = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmClear = () => {
    DAYS_OF_WEEK.forEach((day) => {
      updateDayHours(day.value, {
        isEnabled: false,
        startTime: '09:00 AM',
        endTime: '05:00 PM',
      });
    });
    setShowConfirmDialog(false);
  };

  const handleCancelClear = () => {
    setShowConfirmDialog(false);
  };

  const enabledDays = consultingHours.filter((h) => h.isEnabled);
  const hasEnabledDays = enabledDays.length > 0;
  const hasUnsavedChanges =
    JSON.stringify(consultingHours) !== JSON.stringify(savedHours);
  const isSaved = savedHours.length > 0 && !hasUnsavedChanges;

  if (loading) {
    return <div className={styles.loading}>Loading consulting hours...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.workflowSteps}>
        <div
          className={`${styles.step} ${hasEnabledDays ? styles.stepCompleted : styles.stepActive}`}
        >
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>Set Consulting Hours</div>
            <div className={styles.stepDescription}>
              Enable days and set time ranges
            </div>
          </div>
        </div>
        <div className={styles.stepConnector} />
        <div
          className={`${styles.step} ${
            isSaved
              ? styles.stepCompleted
              : hasEnabledDays
                ? styles.stepActive
                : styles.stepPending
          }`}
        >
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>Save Hours</div>
            <div className={styles.stepDescription}>
              Save your settings to database
            </div>
          </div>
        </div>
        <div className={styles.stepConnector} />
        <div
          className={`${styles.step} ${isSaved ? styles.stepActive : styles.stepPending}`}
        >
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>Generate Slots</div>
            <div className={styles.stepDescription}>
              Create time slots for bookings
            </div>
          </div>
        </div>
      </div>

      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Professional Consulting Hours</h3>
          <p className={styles.subtitle}>
            Configure when this therapist is available. After saving, generate
            time slots for patient bookings.
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={styles.successBanner}>
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {generationStatus && (
        <div
          className={
            generationStatus.includes('Warning') ||
            generationStatus.includes('Failed')
              ? styles.errorBanner
              : styles.successBanner
          }
        >
          <span>
            {generationStatus.includes('Warning') ||
            generationStatus.includes('Failed')
              ? '⚠️'
              : '✓'}
          </span>
          <span>{generationStatus}</span>
        </div>
      )}

      {showConfirmDialog && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <h3 className={styles.confirmTitle}>Confirm Action</h3>
            <p className={styles.confirmMessage}>
              Are you sure you want to clear all consulting hours?
            </p>
            <div className={styles.confirmButtons}>
              <button
                onClick={handleCancelClear}
                className={styles.confirmButtonCancel}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className={styles.confirmButtonConfirm}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>
            Step 1: Set Your Consulting Hours
          </h4>
          {hasEnabledDays && (
            <div className={styles.quickActions}>
              <button
                onClick={applyToWeekdays}
                className={styles.quickActionButton}
                title="Apply Monday's hours to all weekdays"
              >
                Apply to Weekdays
              </button>
              <button
                onClick={applyToAllDays}
                className={styles.quickActionButton}
                title="Apply first enabled day's hours to all days"
              >
                Apply to All Days
              </button>
              <button
                onClick={clearAll}
                className={styles.quickActionButton}
                title="Clear all consulting hours"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Week Summary */}
        {hasEnabledDays && (
          <div className={styles.weekSummary}>
            <h5 className={styles.summaryTitle}>Quick Preview</h5>
            <div className={styles.summaryGrid}>
              {DAYS_OF_WEEK.map((day) => {
                const dayHours = consultingHours.find(
                  (h) => h.dayOfWeek === day.value,
                );
                return (
                  <div
                    key={day.value}
                    className={`${styles.summaryDay} ${
                      dayHours?.isEnabled ? styles.summaryDayEnabled : ''
                    }`}
                  >
                    <div className={styles.summaryDayName}>{day.short}</div>
                    {dayHours?.isEnabled ? (
                      <div className={styles.summaryTime}>
                        {dayHours.startTime} - {dayHours.endTime}
                      </div>
                    ) : (
                      <div className={styles.summaryTimeDisabled}>Closed</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.hoursList}>
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = consultingHours.find(
              (h) => h.dayOfWeek === day.value,
            );
            if (!dayHours) {
              return null;
            }

            return (
              <div
                key={day.value}
                className={`${styles.dayCard} ${
                  dayHours.isEnabled ? styles.enabled : ''
                }`}
              >
                <div className={styles.dayHeader}>
                  <label className={styles.dayToggle}>
                    <input
                      type="checkbox"
                      checked={dayHours.isEnabled}
                      onChange={() => toggleDay(day.value)}
                    />
                    <span className={styles.dayLabel}>{day.label}</span>
                  </label>
                </div>

                {dayHours.isEnabled && (
                  <div className={styles.timeInputs}>
                    <label className={styles.timeLabel}>
                      Start Time
                      <input
                        type="time"
                        value={convert12To24(dayHours.startTime)}
                        onChange={(e) =>
                          updateDayHours(day.value, {
                            startTime: convert24To12(e.target.value),
                          })
                        }
                        className={styles.timeInput}
                      />
                    </label>
                    <span className={styles.timeSeparator}>to</span>
                    <label className={styles.timeLabel}>
                      End Time
                      <input
                        type="time"
                        value={convert12To24(dayHours.endTime)}
                        onChange={(e) =>
                          updateDayHours(day.value, {
                            endTime: convert24To12(e.target.value),
                          })
                        }
                        className={styles.timeInput}
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>
            Step 2: Save Consulting Hours
            {hasUnsavedChanges && (
              <span className={styles.unsavedBadge}>Unsaved Changes</span>
            )}
            {isSaved && <span className={styles.savedBadge}>✓ Saved</span>}
          </h4>
        </div>
        <div className={styles.saveSection}>
          <p className={styles.saveDescription}>
            {hasUnsavedChanges
              ? 'You have unsaved changes. Click the button below to save your consulting hours to the database.'
              : isSaved
                ? 'Your consulting hours are saved. You can now generate time slots for patient bookings.'
                : 'Set at least one day with consulting hours, then save to continue.'}
          </p>
          <button
            onClick={handleUpdate}
            disabled={saving || generating || !hasEnabledDays}
            className={styles.saveButton}
          >
            {saving
              ? 'Saving...'
              : hasUnsavedChanges
                ? '💾 Save Changes'
                : '💾 Save Consulting Hours'}
          </button>
        </div>
      </div>

      {isSaved && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Step 3: Generate Time Slots</h4>
          </div>
          <div className={styles.generateSection}>
            <p className={styles.generateDescription}>
              Generate time slots based on your saved consulting hours. Slots
              will be created in 30-minute intervals for the selected period.
            </p>
            <div className={styles.generateButtons}>
              <button
                onClick={() => generateSlots(7)}
                disabled={saving || generating}
                className={styles.generateButton}
              >
                {generating ? '⏳ Generating...' : '📅 Generate for 1 Week'}
              </button>
              <button
                onClick={() => generateSlots(30)}
                disabled={saving || generating}
                className={styles.generateButton}
              >
                {generating ? '⏳ Generating...' : '📅 Generate for 1 Month'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
