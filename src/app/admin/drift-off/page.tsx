'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import LottieLoader from '@/components/common/LottieLoader';
import DriftOffResponseList from '@/components/Admin/DriftOffResponseList';
import { useAdminDriftOffResponses, useAssignDriftOffVideo } from '@/app/queries/driftOff/useDriftOff';
import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '@/lib/utils/response.util';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import styles from './styles.module.css';

export default function AdminDriftOffPage() {
  const { data, isLoading, error, refetch } = useAdminDriftOffResponses();
  const { mutateAsync: assignVideo } = useAssignDriftOffVideo();
  const [questions, setQuestions] = useState<ISleepAssessmentQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    refetch();
    loadQuestions();
  }, [refetch]);

  const loadQuestions = async () => {
    try {
      setQuestionsLoading(true);
      setQuestionsError(null);
      const response = await axiosInstance.get<unknown, ApiResponse<ISleepAssessmentQuestion[]>>(
        '/sleep-assessment/questions',
      );
      if (response.success) {
        setQuestions(response.data || []);
      } else {
        setQuestionsError(response.message || 'Failed to load questions');
      }
    } catch {
      setQuestionsError('Failed to load questions');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const responses = data ?? [];

  const handleAssign = async (responseId: string, videoUrl: string) => {
    await assignVideo({ responseId, videoUrl });
    await refetch();
  };

  const isLoadingData = isLoading || questionsLoading;
  const hasError = error || questionsError;

  // Calculate statistics
  const completedResponses = responses.filter((r) => r.completedAt).length;
  const assignedVideos = responses.filter((r) => r.assignedVideoUrl).length;
  const inProgressResponses = responses.length - completedResponses;

  return (
    <div>
      <PageHeader
        title="Drift Off — Sessions"
        subtitle="View all Deep Rest Session responses and assign personalized videos."
      />

      {/* Statistics Summary */}
      {!isLoadingData && !hasError && responses.length > 0 && (
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

      {!isLoadingData && hasError && (
        <div className={styles.errorState}>
          <p className={styles.errorText}>{error ? 'Failed to load responses.' : 'Failed to load questions.'}</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => {
              refetch();
              loadQuestions();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoadingData && !hasError && responses.length === 0 && (
        <div className={styles.emptyState}>
          <p>No Drift Off responses yet.</p>
        </div>
      )}

      {!isLoadingData && !hasError && responses.length > 0 && (
        <DriftOffResponseList responses={responses} questions={questions} onAssign={handleAssign} />
      )}
    </div>
  );
}
