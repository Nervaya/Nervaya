'use client';

import type { DeliveryMethod } from '@/types/supplement.types';
import { FaBox } from 'react-icons/fa6';
import { formatPrice } from '@/utils/cart.util';
import { getShippingCost } from '@/utils/shipping.util';
import styles from './DeliveryOptions.module.css';

const DELIVERY_OPTIONS: { method: DeliveryMethod; label: string; duration: string }[] = [
  { method: 'standard', label: 'Standard Delivery', duration: '5-7 business days' },
  { method: 'express', label: 'Express Delivery', duration: '2-3 business days' },
];

interface DeliveryOptionsProps {
  selectedMethod: DeliveryMethod;
  onSelect: (method: DeliveryMethod) => void;
  subtotal: number;
}

export function DeliveryOptions({ selectedMethod, onSelect, subtotal }: DeliveryOptionsProps) {
  const getCost = (method: DeliveryMethod) => getShippingCost(method, subtotal);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden>
          <FaBox />
        </span>
        <h3 className={styles.headerTitle}>Delivery Options</h3>
      </div>
      <div className={styles.body}>
        {DELIVERY_OPTIONS.map((opt) => {
          const cost = getCost(opt.method);
          const isFree = cost === 0;
          return (
            <label
              key={opt.method}
              className={`${styles.option} ${selectedMethod === opt.method ? styles.optionSelected : ''}`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value={opt.method}
                checked={selectedMethod === opt.method}
                onChange={() => onSelect(opt.method)}
                className={styles.radio}
                aria-label={`${opt.label}, ${opt.duration}, ${isFree ? 'Free' : formatPrice(cost)}`}
              />
              <div className={styles.optionContent}>
                <span className={styles.optionLabel}>{opt.label}</span>
                <span className={styles.optionDuration}>{opt.duration}</span>
              </div>
              <span className={isFree ? styles.optionFree : styles.optionCost}>
                {isFree ? 'Free' : formatPrice(cost)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
