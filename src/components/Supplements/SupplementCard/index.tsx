'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Supplement } from '@/types/supplement.types';
import QuantitySelector from '@/components/common/QuantitySelector';
import Button from '@/components/common/Button';
import { formatPrice } from '@/utils/cart.util';
import styles from './styles.module.css';

interface SupplementCardProps {
  supplement: Supplement;
  onAddToCart?: (supplementId: string, quantity: number) => void;
}

const SupplementCard: React.FC<SupplementCardProps> = ({ supplement, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!onAddToCart) {
      return;
    }
    setAdding(true);
    try {
      await onAddToCart(supplement._id, quantity);
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = supplement.stock === 0;
  const maxQuantity = Math.min(supplement.stock, 10);

  return (
    <div className={styles.card}>
      <Link href={`/supplements/${supplement._id}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={supplement.image || '/default-supplement.png'}
            alt={supplement.name}
            width={300}
            height={300}
            className={styles.image}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-supplement.png';
            }}
          />
          {isOutOfStock && <div className={styles.outOfStockBadge}>Out of Stock</div>}
        </div>
      </Link>
      <div className={styles.content}>
        <Link href={`/supplements/${supplement._id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{supplement.name}</h3>
        </Link>
        <p className={styles.category}>{supplement.category}</p>
        <p className={styles.description}>{supplement.description.substring(0, 100)}...</p>
        <div className={styles.footer}>
          <div className={styles.price}>{formatPrice(supplement.price)}</div>
          {!isOutOfStock && <div className={styles.stock}>In Stock ({supplement.stock})</div>}
        </div>
        {!isOutOfStock && (
          <div className={styles.actions}>
            <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={maxQuantity} disabled={adding} />
            <Button
              variant="primary"
              onClick={handleAddToCart}
              loading={adding}
              disabled={adding || isOutOfStock}
              className={styles.addButton}
            >
              Add to Cart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplementCard;
