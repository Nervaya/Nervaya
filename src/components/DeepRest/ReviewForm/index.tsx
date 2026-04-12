'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { ICON_STAR } from '@/constants/icons';
import { deepRestApi } from '@/lib/api/deepRest';
import styles from './styles.module.css';

interface ReviewFormProps {
  responseId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ responseId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await deepRestApi.submitReview(responseId, {
        rating,
        comment: comment.trim() || undefined,
      });

      if (result.success) {
        setSubmitted(true);
        onSuccess?.();
      } else {
        setError(result.message || 'Failed to submit review');
      }
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <p className={styles.success}>Thank you for your review! It will appear after admin approval.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h4 className={styles.heading}>Write a Review</h4>

      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={styles.star}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Icon
              icon={ICON_STAR}
              width={24}
              height={24}
              className={star <= (hoveredRating || rating) ? styles.starFilled : styles.starEmpty}
            />
          </button>
        ))}
      </div>

      <textarea
        className={styles.textarea}
        placeholder="Share your experience with this session..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
      />

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
