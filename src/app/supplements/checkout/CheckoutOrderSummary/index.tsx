'use client';

import { FaReceipt, FaShieldHalved } from 'react-icons/fa6';
import { formatPrice, getCartItemCount } from '@/utils/cart.util';
import { getShippingCost } from '../useCheckout';
import type { Cart, DeliveryMethod } from '@/types/supplement.types';
import Button from '@/components/common/Button';
import styles from './styles.module.css';

interface CheckoutOrderSummaryProps {
  cart: Cart;
  deliveryMethod?: DeliveryMethod;
  promoDiscount?: number;
  onProceedToPayment: () => void;
  loading?: boolean;
}

export function CheckoutOrderSummary({
  cart,
  deliveryMethod = 'standard',
  promoDiscount = 0,
  onProceedToPayment,
  loading = false,
}: CheckoutOrderSummaryProps) {
  const itemCount = getCartItemCount(cart.items);
  const subtotal = cart.totalAmount;
  const shipping = getShippingCost(deliveryMethod, subtotal);
  const total = Math.max(0, subtotal + shipping - promoDiscount);

  return (
    <div className={styles.summary}>
      <div className={styles.summaryHeader}>
        <span className={styles.summaryHeaderIcon} aria-hidden>
          <FaReceipt />
        </span>
        <h2 className={styles.summaryTitle}>Order Summary</h2>
      </div>
      <div className={styles.summaryBody}>
        <div className={styles.summaryDetails}>
          <div className={styles.summaryRow}>
            <span>Number of products</span>
            <span>{itemCount}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipment</span>
            <span className={shipping === 0 ? styles.shipmentFree : undefined}>
              {shipping === 0 ? 'Free' : formatPrice(shipping)}
            </span>
          </div>
          {promoDiscount > 0 && (
            <div className={styles.summaryRow}>
              <span>Discount</span>
              <span className={styles.discount}>−{formatPrice(promoDiscount)}</span>
            </div>
          )}
          {subtotal < 500 && deliveryMethod === 'standard' && (
            <div className={styles.freeShipping}>
              Add {formatPrice(500 - subtotal)} more for free standard shipping!
            </div>
          )}
          <div className={styles.divider} />
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            type="button"
            variant="primary"
            onClick={onProceedToPayment}
            loading={loading}
            className={styles.proceedButton}
          >
            Proceed to Payment
          </Button>
          <p className={styles.securityMessage}>
            <span className={styles.securityIcon} aria-hidden>
              <FaShieldHalved />
            </span>
            Your payment is secure
          </p>
        </div>
      </div>
    </div>
  );
}
