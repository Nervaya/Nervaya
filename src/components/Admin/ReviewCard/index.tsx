'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { adminReviewsApi, type AdminReview } from '@/lib/api/adminReviews';
import styles from './styles.module.css';

interface ReviewCardProps {
  review: AdminReview;
  onVisibilityToggled: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>
          {i < rating ? '\u2605' : '\u2606'}
        </span>
      ))}
    </span>
  );
}

function formatItemType(itemType: string): string {
  if (itemType === 'DriftOff') return 'Deep Rest';
  if (itemType === 'Therapy') return 'Therapy';
  return 'Supplement';
}

export default function ReviewCard({ review, onVisibilityToggled }: ReviewCardProps) {
  const [toggling, setToggling] = useState(false);

  const product = typeof review.productId === 'object' ? review.productId : null;
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleToggleVisibility = async () => {
    try {
      setToggling(true);
      const response = await adminReviewsApi.toggleVisibility(review._id);
      if (response.success) {
        toast.success(`Review ${review.isVisible ? 'hidden' : 'made visible'} successfully`);
        onVisibilityToggled();
      } else {
        toast.error(response.message ?? 'Failed to toggle visibility');
      }
    } catch {
      toast.error('Failed to toggle visibility');
    } finally {
      setToggling(false);
    }
  };

  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.productInfo}>
          {product?.image && (
            <div className={styles.productImage}>
              <Image src={product.image} alt={product.name} width={48} height={48} />
            </div>
          )}
          <div>
            <h3 className={styles.productName}>{product?.name ?? 'Unknown Product'}</h3>
            <p className={styles.reviewDate}>{formattedDate}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.itemBadge} ${styles[`badge${review.itemType}`]}`}>
            {formatItemType(review.itemType)}
          </span>
          <button
            type="button"
            className={`${styles.toggle} ${review.isVisible ? styles.toggleOn : styles.toggleOff}`}
            onClick={handleToggleVisibility}
            disabled={toggling}
            aria-label={review.isVisible ? 'Hide review' : 'Show review'}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.reviewMeta}>
          <span className={styles.userName}>{review.userDisplayName ?? 'Anonymous'}</span>
          <StarRating rating={review.rating} />
        </div>
        {review.comment && <p className={styles.comment}>{review.comment}</p>}
      </div>
    </li>
  );
}
