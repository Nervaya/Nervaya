'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { IoAdd, IoDocumentTextOutline, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import LottieLoader from '@/components/common/LottieLoader';
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
          <IoAdd aria-hidden />
          Add Question
        </Link>
      </header>

      {loading ? (
        <div className={styles.loadingContainer}>
          <LottieLoader width={200} height={200} />
        </div>
      ) : questions.length === 0 ? (
        <div className={styles.emptyState}>
          <IoDocumentTextOutline aria-hidden />
          <h3>No Questions Yet</h3>
          <p>Create your first assessment question to get started.</p>
          <Link href="/admin/sleep-assessment/add" className={styles.addButton}>
            Add Question
          </Link>
        </div>
      ) : (
        <div className={styles.carouselContainer}>
          {/* Progress indicator */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                ['--progress' as string]: `${((currentIndex + 1) / questions.length) * 100}%`,
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
            <IoChevronBack aria-hidden />
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
                </div>
              </div>

              <div className={styles.questionContent}>
                <h3 className={styles.questionText}>{currentQuestion.questionText}</h3>

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
            <IoChevronForward aria-hidden />
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
