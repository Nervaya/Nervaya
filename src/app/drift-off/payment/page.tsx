'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import DriftOffPaymentHandler from '@/components/DriftOff/DriftOffPaymentHandler';
import { DRIFT_OFF_SESSION_PRICE } from '@/lib/constants/driftOff.constants';
import { useDriftOffPayment } from './useDriftOffPayment';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '@/lib/utils/response.util';
import type { IDriftOffOrder } from '@/types/driftOff.types';
import styles from './styles.module.css';

const BENEFITS = [
  '25-min personalized Deep Rest audio session',
  'Curated by certified sleep & wellness specialists',
  'Targets your specific mental and sleep needs',
  'Access your session anytime via your dashboard',
  'Expert support included',
] as const;

export default function DriftOffPaymentPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  const {
    driftOffOrderId,
    razorpayOrderId,
    razorpayKeyId,
    isCreating,
    error,
    showPaymentHandler,
    initiatePayment,
    handlePaymentError,
  } = useDriftOffPayment();

  // Check if user already has a paid order
  useEffect(() => {
    const checkExistingPaidOrder = async () => {
      if (!isAuthenticated) {
        setIsChecking(false);
        return;
      }

      try {
        const ordersRes = await axiosInstance.get<unknown, ApiResponse<IDriftOffOrder[]>>('/drift-off/orders');

        if (ordersRes.success && ordersRes.data) {
          const paidOrder = ordersRes.data.find((order) => order.paymentStatus === 'paid');
          if (paidOrder) {
            router.replace(`/drift-off/assessment?orderId=${paidOrder._id}`);
          }
        }
      } catch {
        // Failed to check existing orders
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingPaidOrder();
  }, [isAuthenticated, router]);

  // Show loading while checking for existing orders
  if (isChecking) {
    return (
      <Sidebar>
        <div className={styles.wrapper}>
          <div className={styles.loading}>
            <p>Checking your session status...</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.cardLeft}>
              <span className={styles.badge}>Deep Rest Session</span>
              <h1 className={styles.title}>Your Custom Sleep Session</h1>
              <p className={styles.subtitle}>
                A 25-minute personalized audio session curated specifically for your sleep patterns and mental needs by
                our specialists.
              </p>
              <ul className={styles.benefits} aria-label="Session benefits">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className={styles.benefitItem}>
                    <span className={styles.checkIcon} aria-hidden>
                      ✓
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.cardRight}>
              <div className={styles.priceCard}>
                <p className={styles.priceLabel}>Session Price</p>
                <p className={styles.price}>₹{DRIFT_OFF_SESSION_PRICE}</p>
                <p className={styles.priceNote}>One-time payment · Personalized for you</p>

                {error && (
                  <div className={styles.error} role="alert">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>⚠️</span>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Payment Error</div>
                        <div>{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                {!showPaymentHandler && (
                  <button type="button" className={styles.payBtn} onClick={initiatePayment} disabled={isCreating}>
                    {isCreating ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span className={styles.spinner}></span>
                        Processing…
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        🔒 Pay Now
                      </span>
                    )}
                  </button>
                )}

                {showPaymentHandler && driftOffOrderId && razorpayOrderId && razorpayKeyId && (
                  <DriftOffPaymentHandler
                    driftOffOrderId={driftOffOrderId}
                    amount={DRIFT_OFF_SESSION_PRICE}
                    razorpayOrderId={razorpayOrderId}
                    razorpayKeyId={razorpayKeyId}
                    onError={handlePaymentError}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
