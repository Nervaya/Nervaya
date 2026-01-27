'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/common/Loader';
import styles from './styles.module.css';
import type {
  IQuestionOption,
  QuestionType,
  ISleepAssessmentQuestion,
} from '@/types/sleepAssessment.types';

export default function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    questionKey: '',
    questionText: '',
    questionType: 'single_choice' as QuestionType,
    order: 1,
    isRequired: true,
    isActive: true,
    category: 'general',
  });

  const [options, setOptions] = useState<IQuestionOption[]>([
    { id: '1', label: '', value: '' },
    { id: '2', label: '', value: '' },
  ]);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/sleep-assessment/questions/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch question');
        }

        const result = await response.json();
        if (result.success && result.data) {
          const question: ISleepAssessmentQuestion = result.data;
          setFormData({
            questionKey: question.questionKey,
            questionText: question.questionText,
            questionType: question.questionType,
            order: question.order,
            isRequired: question.isRequired,
            isActive: question.isActive,
            category: question.category || 'general',
          });
          if (question.options && question.options.length > 0) {
            setOptions(question.options);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load question',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleOptionChange = (
    index: number,
    field: 'label' | 'value',
    value: string,
  ) => {
    setOptions((prev) => {
      const newOptions = [...prev];
      newOptions[index] = { ...newOptions[index], [field]: value };
      if (field === 'label' && !newOptions[index].value) {
        newOptions[index].value = value.toLowerCase().replace(/\s+/g, '_');
      }
      return newOptions;
    });
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: String(prev.length + 1), label: '', value: '' },
    ]);
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
      const validOptions = options.filter(
        (opt) => opt.label.trim() && opt.value.trim(),
      );

      if (formData.questionType !== 'text' && validOptions.length < 2) {
        throw new Error('Please add at least 2 options for this question type');
      }

      const response = await fetch(`/api/sleep-assessment/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: formData.questionText,
          questionType: formData.questionType,
          order: formData.order,
          isRequired: formData.isRequired,
          isActive: formData.isActive,
          category: formData.category,
          options:
            formData.questionType === 'text'
              ? []
              : validOptions.map((opt, i) => ({
                ...opt,
                id: String(i + 1),
              })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update question');
      }

      router.push('/admin/sleep-assessment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showOptions = formData.questionType !== 'text';

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px 20px',
          }}
        >
          <Loader size="lg" text="Loading question..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin/sleep-assessment" className={styles.backLink}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Questions
        </Link>
        <h1 className={styles.title}>Edit Question</h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="questionKey" className={styles.label}>
              Question Key
              <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="questionKey"
              name="questionKey"
              value={formData.questionKey}
              className={styles.input}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <span className={styles.hint}>Question key cannot be changed</span>
          </div>

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
            <select
              id="questionType"
              name="questionType"
              value={formData.questionType}
              onChange={handleInputChange}
              className={styles.select}
              required
            >
              <option value="single_choice">Single Choice</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="text">Text Input</option>
              <option value="scale">Scale</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="e.g., general, habits, health"
            />
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isRequired"
              checked={formData.isRequired}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>Required question</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              Active (visible to users)
            </span>
          </label>
        </div>

        {showOptions && (
          <div className={styles.optionsSection}>
            <div className={styles.optionsHeader}>
              <h3 className={styles.optionsTitle}>Answer Options</h3>
              <button
                type="button"
                onClick={addOption}
                className={styles.addOptionButton}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Add Option
              </button>
            </div>

            <ul className={styles.optionsList}>
              {options.map((option, index) => (
                <li
                  key={option.id || `option-${index}`}
                  className={styles.optionItem}
                >
                  <span className={styles.optionNumber}>{index + 1}</span>
                  <div className={styles.optionInputs}>
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) =>
                        handleOptionChange(index, 'label', e.target.value)
                      }
                      className={styles.input}
                      placeholder="Option label"
                      required={showOptions}
                    />
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) =>
                        handleOptionChange(index, 'value', e.target.value)
                      }
                      className={styles.input}
                      placeholder="Option value"
                      required={showOptions}
                    />
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className={styles.removeOptionButton}
                      aria-label="Remove option"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 6L6 18M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.formActions}>
          <Link href="/admin/sleep-assessment" className={styles.cancelButton}>
            Cancel
          </Link>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size="sm" color="white" />
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
