'use client';

import React, { useEffect, useCallback } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { driftOffApi } from '@/lib/api/driftOff';
import type { RazorpayPaymentResponse } from '@/types/payment.types';
import styles from './styles.module.css';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler?: (response: RazorpayPaymentResponse) => void;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

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

  const handlePayment = useCallback(async () => {
    if (!window.Razorpay) {
      onError?.('Razorpay SDK not loaded');
      return;
    }
    const options: RazorpayOptions = {
      key: razorpayKeyId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'Nervaya',
      description: 'Deep Rest Session',
      order_id: razorpayOrderId,
      handler: async (response: RazorpayPaymentResponse) => {
        try {
          const result = await driftOffApi.verifyPayment({
            driftOffOrderId,
            paymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          if (result.success) {
            router.push(`/drift-off/assessment?orderId=${driftOffOrderId}`);
          } else {
            onError?.(result.message || 'Payment verification failed');
          }
        } catch {
          onError?.('Failed to verify payment');
        }
      },
      prefill: { name: userName || '', email: userEmail || '' },
      theme: { color: '#7c3aed' },
      modal: { ondismiss: () => onError?.('Payment cancelled') },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }, [razorpayKeyId, amount, razorpayOrderId, driftOffOrderId, userName, userEmail, onError, router]);

  useEffect(() => {
    if (window.Razorpay && razorpayOrderId) {
      handlePayment();
    }
  }, [razorpayOrderId, handlePayment]);

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (razorpayOrderId && razorpayKeyId) handlePayment();
        }}
      />
      <div className={styles.loading}>
        <p>Opening payment gateway…</p>
      </div>
    </>
  );
};

export default DriftOffPaymentHandler;
