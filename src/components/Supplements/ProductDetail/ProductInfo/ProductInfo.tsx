'use client';

import React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { QuantitySelector, Button, StarRating } from '@/components/common';
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
  error: string | null;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  supplement,
  quantity,
  onQuantityChange,
  onAddToCart,
  adding,
  isOutOfStock,
  maxQuantity,
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
              <Link href="/cart" className={styles.buyNowLink}>
                <Button variant="ghost" type="button" className={styles.buyNowButton}>
                  Buy Now
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.trustBadges}>
        {[
          { src: '/fssai.png', label: 'FSSAI Approved', width: 42, height: 42 },
          { src: '/badge.png', label: 'Quality Pure', width: 42, height: 42 },
          { src: '/safety.png', label: 'No Side Effects', width: 42, height: 42 },
        ].map((item) => (
          <div key={item.label} className={styles.trustBadgeItem}>
            <div className={styles.trustIconContainer}>
              <NextImage
                src={item.src}
                alt={item.label}
                width={item.width}
                height={item.height}
                className={styles.trustImage}
              />
            </div>
            <span className={styles.trustLabelText}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductInfo;
