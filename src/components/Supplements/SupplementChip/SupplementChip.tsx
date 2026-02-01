'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Supplement } from '@/types/supplement.types';
import { formatPrice } from '@/utils/cart.util';
import StarRating from '@/components/common/StarRating';
import styles from './SupplementChip.module.css';

interface SupplementChipProps {
  supplement: Supplement;
}

const SupplementChip: React.FC<SupplementChipProps> = ({ supplement }) => {
  const imageUrl = supplement.images?.length ? supplement.images[0] : supplement.image;
  const originalPrice = supplement.originalPrice;
  const hasDiscount = originalPrice != null && originalPrice > supplement.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - supplement.price) / originalPrice) * 100)
    : undefined;

  return (
    <Link href={`/supplements/${supplement._id}`} className={styles.chip} aria-label={`View ${supplement.name}`}>
      <div className={styles.imageWrap}>
        <Image
          src={imageUrl || '/default-supplement.png'}
          alt={supplement.name}
          width={220}
          height={220}
          className={styles.image}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-supplement.png';
          }}
        />
        {discountPercent != null && discountPercent > 0 && <span className={styles.badge}>{discountPercent}% OFF</span>}
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{supplement.name}</h3>
        <div className={styles.ratingRow}>
          <StarRating rating={supplement.averageRating ?? 0} size="sm" />
          <span className={styles.reviewCount}>{supplement.reviewCount ?? 0}</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(supplement.price)}</span>
          {hasDiscount && originalPrice != null && (
            <span className={styles.originalPrice}>{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SupplementChip;
