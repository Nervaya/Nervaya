'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import { GlobalLoader } from '@/components/common/GlobalLoader';
import DriftOffPaymentHandler from '@/components/DeepRest/DriftOffPaymentHandler';
import { DRIFT_OFF_SESSION_PRICE, DRIFT_OFF_SESSION_IMAGE } from '@/lib/constants/driftOff.constants';
import { deepRestApi } from '@/lib/api/deepRest';
import { configApi } from '@/lib/api/config';
import { cartApi } from '@/lib/api/cart';
import { useCart } from '@/context/CartContext';
import { useDeepRestPayment } from './useDeepRestPayment';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '@/lib/utils/response.util';
import type { IDriftOffOrder, IDriftOffResponse } from '@/types/driftOff.types';
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
  const [isChecking, setIsChecking] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [dynamicPrice, setDynamicPrice] = useState<number>(DRIFT_OFF_SESSION_PRICE);
  const [isAdding, setIsAdding] = useState(false);
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
    handlePaymentError,
  } = useDeepRestPayment();

  // We no longer call global showLoader() here to keep it 'inside the page'

  useEffect(() => {
    configApi.getPublic().then((res) => {
      const sessionPrice = res.data?.driftOffSessionPrice;
      if (res.success && typeof sessionPrice === 'number') {
        setDynamicPrice(sessionPrice);
      }
    });
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const checkExistingPaidOrder = async () => {
      if (!isAuthenticated) {
        setIsChecking(false);
        return;
      }

      try {
        setInitError(null);
        const [ordersRes, responsesRes] = await Promise.all([
          axiosInstance.get<unknown, ApiResponse<IDriftOffOrder[]>>('/deep-rest/orders'),
          deepRestApi.getResponses(),
        ]);

        if (ordersRes.success && ordersRes.data && ordersRes.data.length > 0) {
          const sortedOrders = [...ordersRes.data].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          const latestPaidOrder = sortedOrders.find((order) => order.paymentStatus === 'paid');

          if (latestPaidOrder) {
            const responseForOrder = responsesRes.data?.find(
              (r: IDriftOffResponse) => r.driftOffOrderId === latestPaidOrder._id,
            );

            if (!responseForOrder || !responseForOrder.completedAt) {
              // Found a pending session - buy logic remains same
            }
          }
        }
        setIsChecking(false);
      } catch {
        setInitError('Failed to verify status. Please refresh.');
        setIsChecking(false);
      }
    };

    checkExistingPaidOrder();
  }, [authLoading, isAuthenticated, router]);

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
