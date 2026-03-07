'use client';

import { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { driftOffApi } from '@/lib/api/driftOff';

interface DriftOffPaymentState {
  driftOffOrderId: string | null;
  razorpayOrderId: string | null;
  razorpayKeyId: string | null;
  isCreating: boolean;
  isVerifying: boolean;
  error: string | null;
  showPaymentHandler: boolean;
}

export function useDriftOffPayment() {
  const [state, setState] = useState<DriftOffPaymentState>({
    driftOffOrderId: null,
    razorpayOrderId: null,
    razorpayKeyId: null,
    isCreating: false,
    isVerifying: false,
    error: null,
    showPaymentHandler: false,
  });

  const initiatePayment = useCallback(async () => {
    setState((prev) => ({ ...prev, isCreating: true, error: null }));
    try {
      const orderRes = await driftOffApi.createOrder();

      if (!orderRes.success || !orderRes.data) {
        const errorMsg = orderRes.message || 'Failed to create order';
        setState((prev) => ({
          ...prev,
          isCreating: false,
          error: `${errorMsg}. Please try again or contact support if the issue persists.`,
        }));
        return;
      }

      const driftOffOrderId = orderRes.data._id;

      const razorpayRes = await driftOffApi.createRazorpayOrder(driftOffOrderId);

      if (!razorpayRes.success || !razorpayRes.data) {
        const errorMsg = razorpayRes.message || 'Failed to initialize payment';
        setState((prev) => ({
          ...prev,
          isCreating: false,
          error: `${errorMsg}. Please try again or contact support if the issue persists.`,
        }));
        return;
      }

      setState({
        driftOffOrderId,
        razorpayOrderId: razorpayRes.data.id,
        razorpayKeyId: razorpayRes.data.key_id,
        isCreating: false,
        isVerifying: false,
        error: null,
        showPaymentHandler: true,
      });
    } catch (err) {
      let msg = 'Failed to process payment';

      if (err instanceof Error) {
        if (err.message.includes('receipt')) {
          msg = 'Payment system configuration error. Please try again in a few moments.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          msg = 'Network connection issue. Please check your internet connection and try again.';
        } else {
          msg = err.message;
        }
      }

      setState((prev) => ({
        ...prev,
        isCreating: false,
        error: `${msg}. Please try again or contact support if the issue persists.`,
      }));
    }
  }, []);

  // Called immediately when payment succeeds (before async verification)
  // flushSync forces React to update the DOM synchronously — eliminates the flash
  // of the payment card between Razorpay modal close and next async render cycle
  const handleVerifyStart = useCallback(() => {
    flushSync(() => {
      setState((prev) => ({ ...prev, isVerifying: true }));
    });
  }, []);

  const handlePaymentError = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      showPaymentHandler: false,
      isVerifying: false,
      error: message === 'Payment cancelled' ? null : message,
    }));
  }, []);

  return { ...state, initiatePayment, handleVerifyStart, handlePaymentError };
}
