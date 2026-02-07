'use client';

import React, { useState } from 'react';
import { FaTag } from 'react-icons/fa6';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import styles from './PromoCode.module.css';

interface PromoCodeProps {
  code: string;
  onCodeChange: (code: string) => void;
  onApply: (code: string) => Promise<void>;
  onRemove?: () => void;
  appliedCode?: string | null;
  discount?: number;
  loading?: boolean;
  error?: string | null;
}

export function PromoCode({
  code,
  onCodeChange,
  onApply,
  onRemove,
  appliedCode,
  discount,
  loading,
  error,
}: PromoCodeProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setLocalError('Enter a promo code');
      return;
    }
    setLocalError(null);
    await onApply(trimmed);
  };

  const displayError = error ?? localError;
  const isApplied = Boolean(appliedCode);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>
        <span className={styles.titleIcon} aria-hidden>
          <FaTag />
        </span>
        Have a promo code?
      </h3>
      <div className={styles.body}>
        {isApplied ? (
          <div className={styles.applied}>
            <span className={styles.appliedCode}>{appliedCode}</span>
            <span className={styles.appliedDiscount}>
              {discount != null && discount > 0 ? `Discount applied` : `Code applied`}
            </span>
            {onRemove && (
              <Button type="button" variant="secondary" onClick={onRemove} className={styles.removeButton}>
                Remove
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.row}>
              <Input
                label="Enter code"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder="Enter code"
                variant="light"
                containerClassName={styles.inputWrap}
                disabled={loading}
                aria-label="Promo code"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleApply}
                loading={loading}
                className={styles.applyButton}
              >
                Apply
              </Button>
            </div>
            {displayError && (
              <p className={styles.errorText} role="alert">
                {displayError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
