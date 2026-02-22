'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoChevronBack, IoAdd, IoClose } from 'react-icons/io5';
import { sleepAssessmentApi } from '@/lib/api/sleepAssessment';
import LottieLoader from '@/components/common/LottieLoader';
import PageHeader from '@/components/PageHeader/PageHeader';
import { Dropdown } from '@/components/common';
import styles from './styles.module.css';
import type { IQuestionOption, QuestionType, ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'scale', label: 'Scale' },
];

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'single_choice' as QuestionType,
    order: 1,
  });

  const [options, setOptions] = useState<IQuestionOption[]>([
    { id: '1', label: '', value: '' },
    { id: '2', label: '', value: '' },
  ]);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const result = await sleepAssessmentApi.getQuestionById(id);
        if (result.success && result.data) {
          const question = result.data as ISleepAssessmentQuestion;
          setFormData({
            questionText: question.questionText,
            questionType: question.questionType,
            order: question.order,
          });
          if (question.options && question.options.length > 0) {
            setOptions(question.options);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load question');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => {
      const newOptions = [...prev];
      const slug =
        value
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '') || `opt_${index + 1}`;
      newOptions[index] = { ...newOptions[index], label: value, value: slug };
      return newOptions;
    });
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { id: String(prev.length + 1), label: '', value: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      return;
    }
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const validOptions = options.filter((opt) => opt.label.trim());
      const questionType = formData.questionType === 'text' ? 'single_choice' : formData.questionType;
      if (validOptions.length < 2) {
        throw new Error('Please add at least 2 options');
      }

      const optionsWithValue = validOptions.map((opt, i) => ({
        id: String(i + 1),
        label: opt.label.trim(),
        value:
          opt.value ||
          opt.label
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '') ||
          `opt_${i + 1}`,
      }));

      const result = await sleepAssessmentApi.updateQuestion(id, {
        questionText: formData.questionText,
        questionType,
        order: formData.order,
        isRequired: true,
        isActive: true,
        options: optionsWithValue.map((o) => ({ value: o.value || o.label, label: o.label })),
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to update question');
      }

      router.push('/admin/sleep-assessment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <PageHeader title="Edit Question" subtitle="Update assessment question details" />
        <div className={styles.loaderWrapper}>
          <LottieLoader width={200} height={200} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="Edit Question"
        subtitle="Update assessment question details"
        actions={
          <Link href="/admin/sleep-assessment" className={styles.backLink}>
            <IoChevronBack aria-hidden />
            Back to Questions
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="order" className={styles.label}>
              Display Order
              <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              className={styles.input}
              min="1"
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="questionText" className={styles.label}>
            Question Text
            <span className={styles.required}>*</span>
          </label>
          <textarea
            id="questionText"
            name="questionText"
            value={formData.questionText}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Enter the question text..."
            rows={3}
            required
          />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="questionType" className={styles.label}>
              Question Type
              <span className={styles.required}>*</span>
            </label>
            <Dropdown
              id="questionType"
              options={QUESTION_TYPE_OPTIONS}
              value={formData.questionType}
              onChange={(value) => setFormData((prev) => ({ ...prev, questionType: value as QuestionType }))}
              ariaLabel="Question type"
              className={styles.select}
            />
          </div>
        </div>

        <div className={styles.optionsSection}>
          <div className={styles.optionsHeader}>
            <h3 className={styles.optionsTitle}>Options</h3>
            <button type="button" onClick={addOption} className={styles.addOptionButton}>
              <IoAdd aria-hidden />
              Add Option
            </button>
          </div>

          <ul className={styles.optionsList}>
            {options.map((option, index) => (
              <li key={option.id || `option-${index}`} className={styles.optionItem}>
                <span className={styles.optionNumber}>{index + 1}</span>
                <div className={styles.optionInputs}>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className={styles.input}
                    placeholder="Option"
                    required
                  />
                </div>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className={styles.removeOptionButton}
                    aria-label="Remove option"
                  >
                    <IoClose aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.formActions}>
          <Link href="/admin/sleep-assessment" className={styles.cancelButton}>
            Cancel
          </Link>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LottieLoader width={50} height={50} />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
