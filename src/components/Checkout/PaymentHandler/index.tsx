"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { RazorpayPaymentResponse } from "@/types/payment.types";
import styles from "./styles.module.css";

interface PaymentHandlerProps {
  orderId: string;
  amount: number;
  razorpayOrderId: string;
  razorpayKeyId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const PaymentHandler: React.FC<PaymentHandlerProps> = ({
  orderId,
  amount,
  razorpayOrderId,
  razorpayKeyId,
  userName,
  userEmail,
  userPhone,
  onSuccess,
  onError,
}) => {
  const router = useRouter();

  const handlePayment = React.useCallback(async () => {
    if (!window.Razorpay) {
      onError?.("Razorpay SDK not loaded");
      return;
    }

    const options = {
      key: razorpayKeyId,
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "Nervaya",
      description: `Order #${orderId}`,
      order_id: razorpayOrderId,
      handler: async (response: RazorpayPaymentResponse) => {
        try {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              paymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const result = await verifyResponse.json();

          if (result.success) {
            onSuccess?.(response.razorpay_payment_id);
            router.push(`/supplements/order-success/${orderId}`);
          } else {
            onError?.(result.message || "Payment verification failed");
          }
        } catch (_error) {
          onError?.("Failed to verify payment");
        }
      },
      prefill: {
        name: userName || "",
        email: userEmail || "",
        contact: userPhone || "",
      },
      theme: {
        color: "#7c3aed",
      },
      modal: {
        ondismiss: () => {
          onError?.("Payment cancelled");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }, [
    razorpayKeyId,
    amount,
    orderId,
    razorpayOrderId,
    userName,
    userEmail,
    userPhone,
    onSuccess,
    onError,
    router,
  ]);

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
          if (razorpayOrderId && razorpayKeyId) {
            handlePayment();
          }
        }}
      />
      <div className={styles.loading}>
        <p>Opening payment gateway...</p>
      </div>
    </>
  );
};

export default PaymentHandler;
