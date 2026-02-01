'use client';

import React from 'react';
import Link from 'next/link';
import QuantitySelector from '@/components/common/QuantitySelector';
import Button from '@/components/common/Button';
import StarRating from '@/components/common/StarRating';
import { formatPrice } from '@/utils/cart.util';
import type { Supplement } from '@/types/supplement.types';
import styles from './ProductInfo.module.css';

interface ProductInfoProps {
  supplement: Supplement;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
  adding: boolean;
  isOutOfStock: boolean;
  maxQuantity: number;
  successMessage: string | null;
  error: string | null;
}

const TRUST_BADGES = [
  { label: 'FSSAI Approved', icon: '✓' },
  { label: '100% Herbal', icon: '✓' },
  { label: 'No Side Effects', icon: '✓' },
];

const ProductInfo: React.FC<ProductInfoProps> = ({
  supplement,
  quantity,
  onQuantityChange,
  onAddToCart,
  adding,
  isOutOfStock,
  maxQuantity,
  successMessage,
  error,
}) => {
  const savings =
    supplement.originalPrice && supplement.originalPrice > supplement.price
      ? supplement.originalPrice - supplement.price
      : 0;

  return (
    <div className={styles.info}>
      <h1 className={styles.title}>{supplement.name}</h1>
      {supplement.shortDescription && <p className={styles.tagline}>{supplement.shortDescription}</p>}
      <div className={styles.ratingRow}>
        <StarRating rating={supplement.averageRating ?? 0} showValue size="md" className={styles.stars} />
        <span className={styles.reviewCount}>{supplement.reviewCount ?? 0} reviews</span>
      </div>
      <div className={styles.priceRow}>
        <div className={styles.pricePair}>
          {supplement.originalPrice != null && supplement.originalPrice > supplement.price && (
            <span className={styles.originalPrice}>MRP: {formatPrice(supplement.originalPrice)}</span>
          )}
          <span className={styles.price}>{formatPrice(supplement.price)}</span>
        </div>
        {savings > 0 && <span className={styles.savings}>Save {formatPrice(savings)} today!</span>}
      </div>
      <p className={styles.description}>{supplement.description}</p>
      {!isOutOfStock && (
        <>
          <div className={styles.quantityActionsRow}>
            <div className={styles.quantityRow}>
              <QuantitySelector
                value={quantity}
                onChange={onQuantityChange}
                min={1}
                max={maxQuantity}
                disabled={adding}
              />
              {(supplement.capsuleCount != null || supplement.unitLabel) && (
                <span className={styles.unitLabel}>
                  {supplement.capsuleCount != null ? `${supplement.capsuleCount} capsules total` : supplement.unitLabel}
                </span>
              )}
            </div>
            <div className={styles.actions}>
              <Button
                variant="primary"
                onClick={onAddToCart}
                loading={adding}
                disabled={adding || isOutOfStock}
                className={styles.addButton}
              >
                Add to Cart
              </Button>
              <Link href="/supplements/cart" className={styles.buyNowLink}>
                <Button variant="secondary" type="button" className={styles.buyNowButton}>
                  Buy Now
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
      {error && <div className={styles.error}>{error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}
      <div className={styles.trustBadges}>
        {TRUST_BADGES.map((b) => (
          <span key={b.label} className={styles.badge}>
            <span className={styles.badgeIcon}>{b.icon}</span>
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProductInfo;
