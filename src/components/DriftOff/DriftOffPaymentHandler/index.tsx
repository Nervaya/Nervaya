'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { driftOffApi } from '@/lib/api/driftOff';
import type { RazorpayPaymentResponse } from '@/types/payment.types';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import RazorpayCheckoutScript from '@/components/common/RazorpayCheckoutScript';
import { trackAudioPurchase } from '@/utils/analytics';

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
  const prefill = useMemo(() => ({ name: userName, email: userEmail }), [userName, userEmail]);
  const handleDismiss = useCallback(() => onError?.('Payment cancelled'), [onError]);

  const handleSuccess = useCallback(
    async (response: RazorpayPaymentResponse) => {
      onVerifyStart?.();
      try {
        const result = await driftOffApi.verifyPayment({
          driftOffOrderId,
          paymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        if (result.success) {
          trackAudioPurchase({
            order_id: driftOffOrderId,
            value: amount,
            currency: 'INR',
          });
          router.replace(`/drift-off/assessment?orderId=${driftOffOrderId}`);
        } else {
          onError?.(result.message || 'Payment verification failed');
        }
      } catch {
        onError?.('Failed to verify payment');
      }
    },
    [amount, driftOffOrderId, onError, onVerifyStart, router],
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
    autoOpen: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      openPaymentModal();
    }
  }, [openPaymentModal]);

  return <RazorpayCheckoutScript onLoad={openPaymentModal} />;
};

export default DriftOffPaymentHandler;
