'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { ICON_ALERT, ICON_DOCUMENT } from '@/constants/icons';
import Sidebar from '@/components/Sidebar/LazySidebar';
import AssessmentContainer from '@/components/SleepAssessment/AssessmentContainer';
import { type BreadcrumbItem } from '@/components/common';
import PageHeader from '@/components/PageHeader/PageHeader';
import containerStyles from '@/app/(customer)/dashboard/styles.module.css';
import styles from './styles.module.css';
import axiosInstance from '@/lib/axios';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import type { ApiResponse } from '@/lib/utils/response.util';
import { useLoading } from '@/context/LoadingContext';

export default function SleepAssessmentPage() {
  const [questions, setQuestions] = useState<ISleepAssessmentQuestion[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isContainerHydrated, setIsContainerHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoader, hideLoader, isLoading } = useLoading();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        showLoader('Loading your assessment...');
        const response = await axiosInstance.get<unknown, ApiResponse<ISleepAssessmentQuestion[]>>(
          '/sleep-assessment/questions',
        );
        if (response.success) {
          setQuestions(response.data || []);
        } else {
          setError('Failed to load questions');
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load assessment questions. Please try again later.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchQuestions();
  }, [showLoader]);

  // Hide loader only when fetching is done AND (hydration is complete OR error OR no questions)
  useEffect(() => {
    if (!isFetching) {
      if (error || questions.length === 0 || isContainerHydrated) {
        hideLoader();
      }
    }
  }, [isFetching, isContainerHydrated, error, questions.length, hideLoader]);

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }, { label: 'Sleep Assessment' }];

  return (
    <Sidebar hideGlobalBreadcrumbs>
      <div className={styles.pageContainer}>
        <div className={containerStyles.container}>
          <PageHeader
            title="Sleep Assessment"
            subtitle="Evaluate your sleep quality and get personalized recommendations"
            breadcrumbs={breadcrumbs}
          />

          {error && !isLoading && (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>
                <Icon icon={ICON_ALERT} aria-hidden />
              </div>
              <p className={styles.errorText}>{error}</p>
              <button type="button" className={styles.retryButton} onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && questions.length === 0 && (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>
                <Icon icon={ICON_DOCUMENT} aria-hidden />
              </div>
              <h2 className={styles.emptyTitle}>No Questions Available</h2>
              <p className={styles.emptyText}>
                The sleep assessment is currently being updated. Please check back later.
              </p>
            </div>
          )}

          {!error && questions.length > 0 && (
            <AssessmentContainer questions={questions} onHydrated={() => setIsContainerHydrated(true)} />
          )}
        </div>
      </div>
    </Sidebar>
  );
}
