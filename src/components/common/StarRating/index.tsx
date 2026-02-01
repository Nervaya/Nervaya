'use client';

import React from 'react';
import styles from './styles.module.css';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = false,
  className = '',
}) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const starItems: { type: 'full' | 'half' | 'empty'; key: string }[] = [];
  let keyIndex = 0;
  for (let i = 0; i < fullStars; i++) {
    starItems.push({ type: 'full', key: `star-${keyIndex++}` });
  }
  if (hasHalf) {
    starItems.push({ type: 'half', key: `star-${keyIndex++}` });
  }
  const emptyCount = maxStars - starItems.length;
  for (let i = 0; i < emptyCount; i++) {
    starItems.push({ type: 'empty', key: `star-${keyIndex++}` });
  }

  return (
    <div
      className={`${styles.container} ${styles[size]} ${className}`}
      role="img"
      aria-label={`${rating} out of ${maxStars} stars`}
    >
      {starItems.map((item) => (
        <span key={item.key} className={`${styles.star} ${styles[item.type]}`}>
          ★
        </span>
      ))}
      {showValue && <span className={styles.value}>{rating.toFixed(1)}</span>}
    </div>
  );
};

export default StarRating;
