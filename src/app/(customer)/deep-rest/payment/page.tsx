'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import { GlobalLoader } from '@/components/common/GlobalLoader';
import DriftOffPaymentHandler from '@/components/DeepRest/DriftOffPaymentHandler';
import { PaymentSuccessScreen, type PaymentSuccessDetails } from '@/components/DeepRest/PaymentSuccessScreen';
import { DRIFT_OFF_SESSION_IMAGE } from '@/lib/constants/driftOff.constants';
import { cartApi } from '@/lib/api/cart';
import { useCart } from '@/context/CartContext';
import { useDeepRestPayment } from './useDeepRestPayment';
import { useDeepRestPaymentInit } from '@/queries/deepRest/useDeepRestPaymentInit';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
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
  const { isAuthenticated, initializing: authLoading } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessDetails | null>(null);
  const { refreshCart } = useCart();

  const {
    deepRestOrderId,
    razorpayOrderId,
    razorpayKeyId,
    isCreating,
    isVerifying,
    error,
    showPaymentHandler,
    initiatePayment,
    handleVerifyStart,
    handleVerifyComplete,
    handlePaymentError,
  } = useDeepRestPayment();

  const {
    isLoading: isChecking,
    error: initError,
    dynamicPrice,
  } = useDeepRestPaymentInit(!authLoading && isAuthenticated);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/deep-rest/payment');
      return;
    }

    setIsAdding(true);
    try {
      const response = await cartApi.add(
        'drift-off-session',
        1,
        'DriftOff',
        'Deep Rest Session',
        dynamicPrice,
        DRIFT_OFF_SESSION_IMAGE,
      );
      if (response.success) {
        refreshCart();
        toast.success('Added to cart successfully!');
        router.push('/cart');
      } else {
        toast.error(`Failed to add: ${response.message}`);
      }
    } catch (_err) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handlePaymentSuccess = (details: PaymentSuccessDetails) => {
    handleVerifyComplete();
    setPaymentSuccess(details);
  };

  if (paymentSuccess) {
    return (
      <>
        <Sidebar>
          <div className={styles.wrapper} />
        </Sidebar>
        <PaymentSuccessScreen
          {...paymentSuccess}
          onComplete={() => router.replace(`/deep-rest/questionnaire?orderId=${paymentSuccess.orderId}`)}
        />
      </>
    );
  }

  if (isVerifying || isChecking || authLoading || isAdding || isCreating) {
    let message = 'Checking status...';
    if (isVerifying) message = 'Verifying your payment...';
    if (isAdding) message = 'Adding to cart...';
    if (isCreating) message = 'Preparing your session...';

    return (
      <Sidebar>
        <div className={styles.wrapper}>
          <GlobalLoader label={message} />
        </div>
      </Sidebar>
    );
  }

  return (
    <>
      <Sidebar>
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <div className={styles.card}>
              <div className={styles.cardLeft}>
                <span className={styles.badge}>Deep Rest Session</span>
                <h1 className={styles.title}>Your Custom Sleep Session</h1>
                <p className={styles.subtitle}>
                  A 25-minute personalized audio session curated specifically for your sleep patterns and mental needs
                  by our specialists.
                </p>
                <ul className={styles.benefits}>
                  {BENEFITS.map((benefit) => (
                    <li key={benefit} className={styles.benefitItem}>
                      <span className={styles.checkIcon}>✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.cardRight}>
                <div className={styles.priceCard}>
                  <p className={styles.priceLabel}>Session Price</p>
                  <p className={styles.price}>₹{dynamicPrice}</p>
                  <p className={styles.priceNote}>One-time payment · Personalized for you</p>

                  {initError && (
                    <div className={styles.error} role="alert">
                      {initError}
                    </div>
                  )}
                  {error && !initError && (
                    <div className={styles.error} role="alert">
                      {error}
                    </div>
                  )}

                  {!initError && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                      <button
                        type="button"
                        className={styles.payBtn}
                        onClick={initiatePayment}
                        disabled={isCreating || showPaymentHandler || isVerifying || isAdding}
                      >
                        🔒 Pay Now
                      </button>

                      <button
                        type="button"
                        className={styles.cartBtn}
                        onClick={handleAddToCart}
                        disabled={isCreating || showPaymentHandler || isVerifying || isAdding}
                      >
                        {isAdding ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  )}

                  {showPaymentHandler && deepRestOrderId && razorpayOrderId && razorpayKeyId && (
                    <DriftOffPaymentHandler
                      driftOffOrderId={deepRestOrderId}
                      amount={dynamicPrice}
                      razorpayOrderId={razorpayOrderId}
                      razorpayKeyId={razorpayKeyId}
                      onVerifyStart={handleVerifyStart}
                      onPaymentSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </>
  );
}
