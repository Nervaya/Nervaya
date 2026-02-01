'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Supplement } from '@/types/supplement.types';
import { formatPrice } from '@/utils/cart.util';
import StarRating from '@/components/common/StarRating';
import styles from './SupplementProductCard.module.css';

interface SupplementProductCardProps {
  supplement: Supplement;
  onAddToCart?: (supplementId: string, quantity: number) => Promise<void> | void;
  variant?: 'grid' | 'list';
}

const SupplementProductCard: React.FC<SupplementProductCardProps> = ({ supplement, onAddToCart, variant = 'grid' }) => {
  const [adding, setAdding] = useState(false);
  const imageUrl = supplement.images?.length ? supplement.images[0] : supplement.image;
  const originalPrice = supplement.originalPrice;
  const hasDiscount = originalPrice != null && originalPrice > supplement.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - supplement.price) / originalPrice) * 100)
    : undefined;
  const isOutOfStock = supplement.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !onAddToCart) return;
    setAdding(true);
    try {
      await onAddToCart(supplement._id, 1);
    } finally {
      setAdding(false);
    }
  };

  const description = supplement.shortDescription || supplement.description;
  const truncatedDesc = description.length > 120 ? `${description.substring(0, 120)}...` : description;

  return (
    <article className={`${styles.card} ${variant === 'list' ? styles.listVariant : ''}`}>
      <Link href={`/supplements/${supplement._id}`} className={styles.imageLink}>
        <div className={styles.imageWrap}>
          <Image
            src={imageUrl || '/default-supplement.png'}
            alt={supplement.name}
            width={300}
            height={300}
            className={styles.image}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-supplement.png';
            }}
          />
          {discountPercent != null && discountPercent > 0 && <span className={styles.badge}>SALE</span>}
        </div>
      </Link>
      <div className={styles.content}>
        <Link href={`/supplements/${supplement._id}`} className={styles.nameLink}>
          <h3 className={styles.name}>{supplement.name}</h3>
        </Link>
        <p className={styles.description}>{truncatedDesc}</p>
        <div className={styles.ratingRow}>
          <StarRating rating={supplement.averageRating ?? 0} size="sm" />
          <span className={styles.reviewCount}>{supplement.reviewCount ?? 0}</span>
        </div>
        <div className={styles.priceRow}>
          {hasDiscount && originalPrice != null && (
            <span className={styles.mrp}>MRP: {formatPrice(originalPrice)}</span>
          )}
          <span className={styles.price}>{formatPrice(supplement.price)}</span>
        </div>
        <div className={styles.actions}>
          {!isOutOfStock && onAddToCart ? (
            <button type="button" onClick={handleAddToCart} disabled={adding} className={styles.addButton}>
              {adding ? 'Adding...' : 'ADD TO CART'}
            </button>
          ) : !isOutOfStock ? (
            <Link href={`/supplements/${supplement._id}`} className={styles.addButton}>
              ADD TO CART
            </Link>
          ) : (
            <span className={styles.outOfStock}>Out of Stock</span>
          )}
        </div>
        <Link href={`/supplements/${supplement._id}`} className={styles.quickView}>
          QUICK VIEW
        </Link>
      </div>
    </article>
  );
};

export default SupplementProductCard;
