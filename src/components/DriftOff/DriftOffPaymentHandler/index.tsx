'use client';

import React, { useCallback } from 'react';
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
  onError?: (message: string) => void;
}

const DriftOffPaymentHandler: React.FC<DriftOffPaymentHandlerProps> = ({
  driftOffOrderId,
  amount,
  razorpayOrderId,
  razorpayKeyId,
  userName,
  userEmail,
  onError,
}) => {
  const router = useRouter();

  const handleSuccess = useCallback(
    async (response: RazorpayPaymentResponse) => {
      try {
        const result = await driftOffApi.verifyPayment({
          driftOffOrderId,
          paymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        if (result.success) {
          router.replace(`/drift-off/assessment?orderId=${driftOffOrderId}`);
        } else {
          onError?.(result.message || 'Payment verification failed');
        }
      } catch {
        onError?.('Failed to verify payment');
      }
    },
    [driftOffOrderId, onError, router],
  );

  const { openPaymentModal } = useRazorpayCheckout({
    razorpayKeyId,
    razorpayOrderId,
    amount,
    name: 'Nervaya',
    description: 'Deep Rest Session',
    prefill: { name: userName, email: userEmail },
    onSuccess: handleSuccess,
    onError,
    onDismiss: () => onError?.('Payment cancelled'),
    autoOpen: true,
  });

  return (
    <>
      <RazorpayCheckoutScript onLoad={() => openPaymentModal()} />
      <div className={styles.loading}>
        <p>Opening payment gateway…</p>
      </div>
    </>
  );
};

export default DriftOffPaymentHandler;
