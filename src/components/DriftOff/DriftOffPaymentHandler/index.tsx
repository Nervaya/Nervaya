'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { driftOffApi } from '@/lib/api/driftOff';
import type { RazorpayPaymentResponse } from '@/types/payment.types';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import RazorpayCheckoutScript from '@/components/common/RazorpayCheckoutScript';
import styles from './styles.module.css';

interface DriftOffPaymentHandlerProps {
  driftOffOrderId: string;
  amount: number;
  razorpayOrderId: string;
  razorpayKeyId: string;
  userName?: string;
  userEmail?: string;
  onVerifyStart?: () => void;
  onError?: (message: string) => void;
}

const DriftOffPaymentHandler: React.FC<DriftOffPaymentHandlerProps> = ({
  driftOffOrderId,
  amount,
  razorpayOrderId,
  razorpayKeyId,
  userName,
  userEmail,
  onVerifyStart,
  onError,
}) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Stable prefill object — only changes when name/email actually change
  const prefill = useMemo(() => ({ name: userName, email: userEmail }), [userName, userEmail]);

  // Stable dismiss handler — only changes when onError changes
  const handleDismiss = useCallback(() => onError?.('Payment cancelled'), [onError]);

  const handleSuccess = useCallback(
    async (response: RazorpayPaymentResponse) => {
      // Immediately signal verification started — hides the payment page UI before async call
      onVerifyStart?.();
      try {
        const result = await driftOffApi.verifyPayment({
          driftOffOrderId,
          paymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        if (result.success) {
          setIsNavigating(true); // Keep loading state active during Next.js route transition
          router.replace(`/drift-off/assessment?orderId=${driftOffOrderId}`);
        } else {
          onError?.(result.message || 'Payment verification failed');
        }
      } catch {
        onError?.('Failed to verify payment');
      }
    },
    [driftOffOrderId, onVerifyStart, onError, router],
  );

  const { openPaymentModal } = useRazorpayCheckout({
    razorpayKeyId,
    razorpayOrderId,
    amount,
    name: 'Nervaya',
    description: 'Deep Rest Session',
    prefill,
    onSuccess: handleSuccess,
    onError,
    onDismiss: handleDismiss,
    autoOpen: true,
  });

  return (
    <>
      <RazorpayCheckoutScript onLoad={() => openPaymentModal()} />
      {isNavigating ? (
        <div className={styles.loading}>
          <p>Redirecting to assessment…</p>
        </div>
      ) : (
        <div className={styles.loading}>
          <p>Opening payment gateway…</p>
        </div>
      )}
    </>
  );
};

export default DriftOffPaymentHandler;
