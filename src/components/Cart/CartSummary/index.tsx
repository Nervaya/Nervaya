'use client';

import React from 'react';
import Link from 'next/link';
import { Cart } from '@/types/supplement.types';
import Button from '@/components/common/Button';
import { formatPrice, getCartItemCount } from '@/utils/cart.util';
import styles from './styles.module.css';

interface CartSummaryProps {
  cart: Cart;
  onCheckout?: () => void;
  loading?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  cart,
  onCheckout,
  loading = false,
}) => {
  const itemCount = getCartItemCount(cart.items);
  const subtotal = cart.totalAmount;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <div className={styles.summary}>
      <h2 className={styles.title}>Order Summary</h2>
      <div className={styles.details}>
        <div className={styles.row}>
          <span>Items ({itemCount})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.row}>
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        {subtotal < 500 && (
          <div className={styles.freeShipping}>
            Add {formatPrice(500 - subtotal)} more for free shipping!
          </div>
        )}
        <div className={styles.divider}></div>
        <div className={`${styles.row} ${styles.totalRow}`}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <div className={styles.actions}>
        {cart.items.length > 0 ? (
          <Button
            variant="primary"
            onClick={onCheckout}
            loading={loading}
            className={styles.checkoutButton}
          >
            Proceed to Checkout
          </Button>
        ) : (
          <Link href="/supplements" className={styles.shopLink}>
            <Button variant="primary" className={styles.checkoutButton}>
              Continue Shopping
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default CartSummary;
