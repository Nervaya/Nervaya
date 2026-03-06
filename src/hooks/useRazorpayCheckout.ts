import { useCallback, useEffect } from 'react';
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
  const openPaymentModal = useCallback(() => {
    if (!window.Razorpay) {
      onError?.('Razorpay SDK not loaded');
      return;
    }

    const options: RazorpayOptions = {
      key: razorpayKeyId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name,
      description,
      order_id: razorpayOrderId,
      handler: onSuccess,
      prefill: {
        name: prefill?.name || '',
        email: prefill?.email || '',
        contact: prefill?.contact || '',
      },
      theme: { color: '#7c3aed' },
      modal: {
        ondismiss: () => {
          onDismiss?.();
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }, [razorpayKeyId, amount, name, description, razorpayOrderId, onSuccess, onError, onDismiss, prefill]);

  useEffect(() => {
    if (autoOpen && window.Razorpay && razorpayOrderId) {
      openPaymentModal();
    }
  }, [autoOpen, razorpayOrderId, openPaymentModal]);

  return { openPaymentModal };
}
