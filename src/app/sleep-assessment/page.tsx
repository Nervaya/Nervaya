'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar/LazySidebar';
import AssessmentContainer from '@/components/SleepAssessment/AssessmentContainer';
import styles from './styles.module.css';
import axiosInstance from '@/lib/axios';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import type { ApiResponse } from '@/lib/utils/response.util';

export default function SleepAssessmentPage() {
    const [questions, setQuestions] = useState<ISleepAssessmentQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axiosInstance.get<unknown, ApiResponse<ISleepAssessmentQuestion[]>>('/sleep-assessment/questions');
                if (response.success) {
                    setQuestions(response.data || []);
                } else {
                    setError('Failed to load questions');
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Error fetching questions:', err);
                setError('Failed to load assessment questions. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    return (
        <Sidebar>
            <div className={styles.pageContainer}>
                {isLoading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner} />
                        <p className={styles.loadingText}>Loading assessment...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="17" r="1" fill="currentColor" />
                            </svg>
                        </div>
                        <p className={styles.errorText}>{error}</p>
                        <button
                            type="button"
                            className={styles.retryButton}
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!isLoading && !error && questions.length === 0 && (
                    <div className={styles.emptyContainer}>
                        <div className={styles.emptyIcon}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M7 9H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M7 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h2 className={styles.emptyTitle}>No Questions Available</h2>
                        <p className={styles.emptyText}>
                            The sleep assessment is currently being updated. Please check back later.
                        </p>
                    </div>
                )}

                {!isLoading && !error && questions.length > 0 && (
                    <AssessmentContainer questions={questions} />
                )}
            </div>
        </Sidebar>
    );
}
