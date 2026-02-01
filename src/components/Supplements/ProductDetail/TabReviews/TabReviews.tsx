'use client';

import React, { useState, useEffect, useCallback } from 'react';
import StarRating from '@/components/common/StarRating';
import ReviewCard from '../ReviewCard';
import StatusState from '@/components/common/StatusState';
import { reviewsApi } from '@/lib/api/reviews';
import type { Supplement, Review, StarDistribution } from '@/types/supplement.types';
import styles from './TabReviews.module.css';

interface TabReviewsProps {
  supplement: Supplement;
}

const TabReviews: React.FC<TabReviewsProps> = ({ supplement }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewsApi.getByProductId(supplement._id, 1, 20);
      if (response.success && response.data?.data) {
        setReviews(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [supplement._id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const averageRating = supplement.averageRating ?? 0;
  const reviewCount = supplement.reviewCount ?? 0;
  const starDistribution: StarDistribution = supplement.starDistribution ?? {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const totalForPercent = reviewCount || 1;

  if (loading) {
    return (
      <div className={styles.content}>
        <div className={styles.loading}>Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.content}>
        <StatusState
          type="error"
          title="Failed to load reviews"
          message={error}
          action={
            <button type="button" onClick={fetchReviews} className={styles.retryButton}>
              Try again
            </button>
          }
        />
      </div>
    );
  }

  if (reviewCount === 0 && reviews.length === 0) {
    return (
      <div className={styles.content}>
        <StatusState type="empty" title="No reviews yet" message="Be the first to review this product." />
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.summary}>
        <div className={styles.overall}>
          <span className={styles.ratingNumber}>{averageRating.toFixed(1)}</span>
          <StarRating rating={averageRating} size="lg" />
          <span className={styles.reviewCount}>{reviewCount} reviews</span>
        </div>
        <div className={styles.distribution}>
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = starDistribution[star] ?? 0;
            const percent = Math.round((count / totalForPercent) * 100);
            return (
              <div key={star} className={styles.barRow}>
                <span className={styles.barLabel}>{star} star</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${percent}%` }} />
                </div>
                <span className={styles.barPercent}>{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.list}>
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default TabReviews;
