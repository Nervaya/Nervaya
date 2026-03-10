'use client';

import { useState, useEffect, useCallback } from 'react';
import LottieLoader from '@/components/common/LottieLoader';
import DriftOffResponseList from '@/components/Admin/DriftOffResponseList';
import { useAdminDriftOffResponses, useAssignDriftOffVideo } from '@/app/queries/driftOff/useDriftOff';
import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '@/lib/utils/response.util';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import styles from './styles.module.css';

export default function SessionsTab() {
  const { data, isLoading, error, refetch } = useAdminDriftOffResponses();
  const { mutateAsync: assignVideo } = useAssignDriftOffVideo();
  const [responseQuestions, setResponseQuestions] = useState<ISleepAssessmentQuestion[]>([]);
  const [responseQuestionsLoading, setResponseQuestionsLoading] = useState(true);

  const loadResponseQuestions = useCallback(async () => {
    try {
      setResponseQuestionsLoading(true);
      const response = await axiosInstance.get<unknown, ApiResponse<ISleepAssessmentQuestion[]>>(
        '/drift-off/questions',
      );
      if (response.success) {
        setResponseQuestions((response.data as ISleepAssessmentQuestion[]) || []);
      }
    } catch {
      // non-fatal
    } finally {
      setResponseQuestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    loadResponseQuestions();
  }, [refetch, loadResponseQuestions]);

  const handleAssign = async (responseId: string, videoUrl: string) => {
    await assignVideo({ responseId, videoUrl });
    await refetch();
  };

  const responses = data ?? [];
  const isLoadingData = isLoading || responseQuestionsLoading;
  const completedResponses = responses.filter((r) => r.completedAt).length;
  const assignedVideos = responses.filter((r) => r.assignedVideoUrl).length;
  const inProgressResponses = responses.length - completedResponses;

  return (
    <div>
      {!isLoadingData && !error && responses.length > 0 && (
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{responses.length}</div>
            <div className={styles.statLabel}>Total Responses</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{completedResponses}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{assignedVideos}</div>
            <div className={styles.statLabel}>Videos Assigned</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{inProgressResponses}</div>
            <div className={styles.statLabel}>In Progress</div>
          </div>
        </div>
      )}

      {isLoadingData && (
        <div className={styles.loaderWrapper}>
          <LottieLoader width={180} height={180} />
        </div>
      )}

      {!isLoadingData && error && (
        <div className={styles.errorState}>
          <p className={styles.errorText}>Failed to load responses.</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => {
              refetch();
              loadResponseQuestions();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoadingData && !error && responses.length === 0 && (
        <div className={styles.emptyState}>
          <p>No Drift Off responses yet.</p>
        </div>
      )}

      {!isLoadingData && !error && responses.length > 0 && (
        <DriftOffResponseList responses={responses} questions={responseQuestions} onAssign={handleAssign} />
      )}
    </div>
  );
}
