'use client';

import { formatPrice } from '@/utils/cart.util';
import type { Cart } from '@/types/supplement.types';
import styles from './styles.module.css';

interface CheckoutOrderSummaryProps {
  cart: Cart;
}

export function CheckoutOrderSummary({ cart }: CheckoutOrderSummaryProps) {
  const shipping = cart.totalAmount > 500 ? 0 : 50;
  const total = cart.totalAmount + shipping;

  return (
    <div className={styles.summary}>
      <h2 className={styles.summaryTitle}>Order Summary</h2>
      <div className={styles.summaryDetails}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatPrice(cart.totalAmount)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        {cart.totalAmount < 500 && (
          <div className={styles.freeShipping}>
            Add {formatPrice(500 - cart.totalAmount)} more for free shipping!
          </div>
        )}
        <div className={styles.divider} />
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
