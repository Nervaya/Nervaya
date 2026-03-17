'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { paymentsApi } from '@/lib/api/payments';
import type { RazorpayPaymentResponse } from '@/types/payment.types';
import { trackPaymentFailed } from '@/utils/analytics';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import { RazorpayCheckoutScript } from '@/components/common';
import styles from './styles.module.css';

interface PaymentHandlerProps {
  orderId: string;
  amount: number;
  razorpayOrderId: string;
  razorpayKeyId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  onVerifyStart?: () => void;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

const PaymentHandler: React.FC<PaymentHandlerProps> = ({
  orderId,
  amount,
  razorpayOrderId,
  razorpayKeyId,
  userName,
  userEmail,
  userPhone,
  onVerifyStart,
  onSuccess,
  onError,
}) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSuccess = useCallback(
    async (response: RazorpayPaymentResponse) => {
      onVerifyStart?.();
      try {
        const result = await paymentsApi.verify({
          orderId,
          paymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });

        if (result.success) {
          onSuccess?.(response.razorpay_payment_id);
          setIsNavigating(true);
          router.push(`/supplements/order-success/${orderId}`);
        } else {
          const reason = result.message || 'Payment verification failed';
          trackPaymentFailed({ order_id: orderId, reason });
          onError?.(reason);
        }
      } catch (_error) {
        trackPaymentFailed({ order_id: orderId, reason: 'Failed to verify payment' });
        onError?.('Failed to verify payment');
      }
    },
    [orderId, onSuccess, onError, router, onVerifyStart],
  );
  const prefill = useMemo(
    () => ({ name: userName, email: userEmail, contact: userPhone }),
    [userName, userEmail, userPhone],
  );
  const handleDismiss = useCallback(() => {
    trackPaymentFailed({ order_id: orderId, reason: 'Payment cancelled by user' });
    onError?.('Payment cancelled');
  }, [orderId, onError]);

  const { openPaymentModal } = useRazorpayCheckout({
    razorpayKeyId,
    razorpayOrderId,
    amount,
    name: 'Nervaya',
    description: `Order #${orderId}`,
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
          <p>Redirecting to order success page…</p>
        </div>
      ) : (
        <div className={styles.loading}>
          <p>Opening payment gateway...</p>
        </div>
      )}
    </>
  );
};

export default PaymentHandler;
