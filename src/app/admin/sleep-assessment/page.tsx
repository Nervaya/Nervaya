'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Loader from '@/components/common/Loader';
import styles from './styles.module.css';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';

export default function AdminSleepAssessmentPage() {
  const [questions, setQuestions] = useState<ISleepAssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      console.error('Failed to fetch questions', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Keep currentIndex in bounds when questions change
  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length) {
      setCurrentIndex(questions.length - 1);
    }
  }, [questions.length, currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1 && !isAnimating) {
      setDirection('next');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentIndex, questions.length, isAnimating]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0 && !isAnimating) {
      setDirection('prev');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentIndex, isAnimating]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index !== currentIndex && !isAnimating) {
        setDirection(index > currentIndex ? 'next' : 'prev');
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex(index);
          setIsAnimating(false);
        }, 300);
      }
    },
    [currentIndex, isAnimating],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating || questions.length === 0) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating, questions.length, goToNext, goToPrev]);

  const handleDelete = async (id: string, questionText: string) => {
    const questionPreview = questionText.substring(0, 50);
    const message =
      `WARNING: Are you sure you want to delete this question?\n\n"${questionPreview}..."\n\n` +
      'This action cannot be undone.';
    // eslint-disable-next-line no-alert
    if (!window.confirm(message)) {
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
        window.alert('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question', error);
    }
  };

  const handleSeedQuestions = async () => {
    if (
      // eslint-disable-next-line no-alert
      !window.confirm('This will seed the database with default sleep assessment questions. Continue?')
    ) {
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
        window.alert(result.message || 'Failed to seed questions');
      }
    } catch (error) {
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

  const currentQuestion = questions[currentIndex];

  return (
    <div className={styles.container} ref={containerRef}>
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
          <Loader size="lg" text="Loading questions..." />
        </div>
      ) : questions.length === 0 ? (
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
              onClick={async () => {
                if (
                  // eslint-disable-next-line no-alert
                  window.confirm('This will wipe all existing questions and seed default ones. Are you sure?')
                ) {
                  setLoading(true);
                  try {
                    const response = await fetch('/api/sleep-assessment/questions/seed?reset=true', { method: 'POST' });
                    if (response.ok) {
                      fetchQuestions();
                    } else {
                      // eslint-disable-next-line no-alert
                      window.alert('Failed to seed questions');
                    }
                  } catch (error) {
                    console.error(error);
                    // eslint-disable-next-line no-alert
                    window.alert('Error seeding questions');
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              className={styles.seedButton}
            >
              Seed Default Questions
            </button>
            <button type="button" onClick={handleSeedQuestions} className={styles.seedButton}>
              Seed Default Questions
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.carouselContainer}>
          {/* Progress indicator */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question counter */}
          <div className={styles.questionCounter}>
            <span className={styles.currentNum}>{currentIndex + 1}</span>
            <span className={styles.separator}>/</span>
            <span className={styles.totalNum}>{questions.length}</span>
          </div>

          {/* Navigation arrows - left */}
          <button
            type="button"
            className={`${styles.navButton} ${styles.navPrev}`}
            onClick={goToPrev}
            disabled={currentIndex === 0 || isAnimating}
            aria-label="Previous question"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Question card with animation */}
          <div className={styles.cardViewport}>
            <div
              className={`${styles.questionCard} ${styles.cardAnimated} ${
                isAnimating ? (direction === 'next' ? styles.slideOutLeft : styles.slideOutRight) : styles.slideIn
              }`}
              key={currentQuestion._id}
            >
              <div className={styles.questionHeader}>
                <span className={styles.orderBadge}>{currentQuestion.order}</span>
                <div className={styles.questionMeta}>
                  <span className={`${styles.typeBadge} ${styles[currentQuestion.questionType]}`}>
                    {getQuestionTypeLabel(currentQuestion.questionType)}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${currentQuestion.isActive ? styles.active : styles.inactive}`}
                  >
                    {currentQuestion.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {currentQuestion.isRequired && <span className={styles.requiredBadge}>Required</span>}
                </div>
              </div>

              <div className={styles.questionContent}>
                <h3 className={styles.questionText}>{currentQuestion.questionText}</h3>
                <code className={styles.questionKey}>{currentQuestion.questionKey}</code>

                {currentQuestion.options && currentQuestion.options.length > 0 && (
                  <div className={styles.optionsPreview}>
                    <span className={styles.optionsLabel}>Options:</span>
                    <ul className={styles.optionsList}>
                      {currentQuestion.options.map((opt) => (
                        <li key={opt.id} className={styles.optionItem}>
                          {opt.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className={styles.questionActions}>
                <button
                  type="button"
                  className={`${styles.toggleButton} ${currentQuestion.isActive ? styles.deactivate : styles.activate}`}
                  onClick={() => handleToggleActive(currentQuestion.questionId, currentQuestion.isActive)}
                >
                  {currentQuestion.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <Link href={`/admin/sleep-assessment/edit/${currentQuestion.questionId}`} className={styles.editButton}>
                  Edit
                </Link>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDelete(currentQuestion.questionId, currentQuestion.questionText)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Navigation arrows - right */}
          <button
            type="button"
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={goToNext}
            disabled={currentIndex === questions.length - 1 || isAnimating}
            aria-label="Next question"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className={styles.dotIndicators}>
            {questions.map((q, index) => (
              <button
                key={q._id}
                type="button"
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                onClick={() => goToIndex(index)}
                aria-label={`Go to question ${index + 1}`}
              />
            ))}
          </div>

          {/* Keyboard hint */}
          <p className={styles.keyboardHint}>
            Use <kbd>←</kbd> <kbd>→</kbd> arrow keys to navigate
          </p>
        </div>
      )}
    </div>
  );
}
