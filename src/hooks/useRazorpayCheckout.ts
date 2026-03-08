import { useCallback, useEffect, useRef } from 'react';
import type { RazorpayPaymentResponse, RazorpayOptions } from '@/types/payment.types';

interface UseRazorpayCheckoutParams {
  razorpayKeyId: string;
  razorpayOrderId: string;
  amount: number;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onError?: (message: string) => void;
  onDismiss?: () => void;
  autoOpen?: boolean;
}

export function useRazorpayCheckout({
  razorpayKeyId,
  razorpayOrderId,
  amount,
  name = 'Nervaya',
  description = '',
  prefill,
  onSuccess,
  onError,
  onDismiss,
  autoOpen = false,
}: UseRazorpayCheckoutParams) {
  // Prevent the modal from ever opening more than once per handler instance
  const hasOpened = useRef(false);

  // Keep latest callbacks in refs so the modal always uses up-to-date handlers
  // without recreating openPaymentModal on every render
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onDismissRef.current = onDismiss;
  }, [onSuccess, onError, onDismiss]);

  const openPaymentModal = useCallback(() => {
    if (!window.Razorpay) {
      onErrorRef.current?.('Razorpay SDK not loaded');
      return;
    }

    // Guarantee the modal only opens once per hook lifecycle
    // (Prevents double-opens on strict-mode autoOpen, but allows re-opening if the user clicks "Pay Now" again)
    if (hasOpened.current) return;
    hasOpened.current = true;

    // Track whether payment was completed so ondismiss doesn't fire on success-close
    let paymentSucceeded = false;

    const options: RazorpayOptions = {
      key: razorpayKeyId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name,
      description,
      order_id: razorpayOrderId,
      handler: (response: RazorpayPaymentResponse) => {
        paymentSucceeded = true;
        onSuccessRef.current(response);
      },
      prefill: {
        name: prefill?.name || '',
        email: prefill?.email || '',
        contact: prefill?.contact || '',
      },
      theme: { color: '#7c3aed' },
      modal: {
        ondismiss: () => {
          // Only treat as cancellation if payment didn't already succeed
          if (!paymentSucceeded) {
            onDismissRef.current?.();
          }
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }, [razorpayKeyId, amount, name, description, razorpayOrderId, prefill]);
  // Note: callbacks intentionally excluded from deps — accessed via refs above

  useEffect(() => {
    if (autoOpen && window.Razorpay && razorpayOrderId) {
      openPaymentModal();
    }
  }, [autoOpen, razorpayOrderId, openPaymentModal]);

  return { openPaymentModal };
}
