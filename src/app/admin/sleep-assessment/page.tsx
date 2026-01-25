'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';

export default function AdminSleepAssessmentPage() {
    const [questions, setQuestions] = useState<ISleepAssessmentQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = useCallback(async () => {
        try {
            const response = await fetch('/api/sleep-assessment/questions?includeInactive=true');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setQuestions(result.data);
                }
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch questions', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleDelete = async (id: string, questionText: string) => {
        const message = `WARNING: Are you sure you want to delete this question?\n\n"${questionText.substring(0, 50)}..."\n\nThis action cannot be undone.`;
        // eslint-disable-next-line no-alert
        if (!confirm(message)) {
            return;
        }

        try {
            const response = await fetch(`/api/sleep-assessment/questions/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchQuestions();
            } else {
                // eslint-disable-next-line no-alert
                alert('Failed to delete question');
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error deleting question', error);
        }
    };

    const handleSeedQuestions = async () => {
        // eslint-disable-next-line no-alert
        if (!confirm('This will seed the database with default sleep assessment questions. Continue?')) {
            return;
        }

        try {
            const response = await fetch('/api/sleep-assessment/questions/seed', {
                method: 'POST',
            });
            if (response.ok) {
                fetchQuestions();
            } else {
                const result = await response.json();
                // eslint-disable-next-line no-alert
                alert(result.message || 'Failed to seed questions');
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error seeding questions', error);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/sleep-assessment/questions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if (response.ok) {
                fetchQuestions();
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error toggling question status', error);
        }
    };

    const getQuestionTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            single_choice: 'Single Choice',
            multiple_choice: 'Multiple Choice',
            text: 'Text Input',
            scale: 'Scale',
        };
        return labels[type] || type;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Sleep Assessment Questions</h1>
                    <p className={styles.subtitle}>Manage and configure assessment questions</p>
                </div>
                <Link href="/admin/sleep-assessment/add" className={styles.addButton}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Add Question
                </Link>
            </header>

            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} />
                    <p>Loading questions...</p>
                </div>
            ) : (
                <div className={styles.questionsList}>
                    {questions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M7 9H17M7 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <h3>No Questions Yet</h3>
                            <p>Create your first assessment question or seed default questions to get started.</p>
                            <div className={styles.emptyStateActions}>
                                <Link href="/admin/sleep-assessment/add" className={styles.emptyStateButton}>
                                    Add Question
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleSeedQuestions}
                                    className={styles.seedButton}
                                >
                                    Seed Default Questions
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ul className={styles.list}>
                            {questions.map((question) => (
                                <li key={question._id} className={styles.questionCard}>
                                    <div className={styles.questionHeader}>
                                        <span className={styles.orderBadge}>{question.order}</span>
                                        <div className={styles.questionMeta}>
                                            <span className={`${styles.typeBadge} ${styles[question.questionType]}`}>
                                                {getQuestionTypeLabel(question.questionType)}
                                            </span>
                                            <span className={`${styles.statusBadge} ${question.isActive ? styles.active : styles.inactive}`}>
                                                {question.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            {question.isRequired && (
                                                <span className={styles.requiredBadge}>Required</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.questionContent}>
                                        <h3 className={styles.questionText}>{question.questionText}</h3>
                                        <code className={styles.questionKey}>{question.questionKey}</code>

                                        {question.options && question.options.length > 0 && (
                                            <div className={styles.optionsPreview}>
                                                <span className={styles.optionsLabel}>Options:</span>
                                                <ul className={styles.optionsList}>
                                                    {question.options.slice(0, 4).map((opt) => (
                                                        <li key={opt.id} className={styles.optionItem}>
                                                            {opt.label}
                                                        </li>
                                                    ))}
                                                    {question.options.length > 4 && (
                                                        <li className={styles.optionMore}>
                                                            +{question.options.length - 4} more
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.questionActions}>
                                        <button
                                            type="button"
                                            className={`${styles.toggleButton} ${question.isActive ? styles.deactivate : styles.activate}`}
                                            onClick={() => handleToggleActive(question._id, question.isActive)}
                                        >
                                            {question.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <Link
                                            href={`/admin/sleep-assessment/edit/${question._id}`}
                                            className={styles.editButton}
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className={styles.deleteButton}
                                            onClick={() => handleDelete(question._id, question.questionText)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
