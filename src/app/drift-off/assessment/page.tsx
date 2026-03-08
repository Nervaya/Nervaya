'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import DriftOffAssessmentContainer from '@/components/DriftOff/DriftOffAssessmentContainer';
import LottieLoader from '@/components/common/LottieLoader';
import axiosInstance from '@/lib/axios';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import type { ApiResponse } from '@/lib/utils/response.util';
import type { IDriftOffOrder } from '@/types/driftOff.types';
import styles from './styles.module.css';

export default function DriftOffAssessmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [questions, setQuestions] = useState<ISleepAssessmentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasCheckedRedirects, setHasCheckedRedirects] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const loadOrderData = useCallback(
    async (orderIdToLoad: string) => {
      // Add a small delay to ensure database is updated after payment
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const [orderRes, questionsRes] = await Promise.all([
          axiosInstance.get<unknown, ApiResponse<IDriftOffOrder>>(`/drift-off/orders/${orderIdToLoad}`),
          axiosInstance.get<unknown, ApiResponse<ISleepAssessmentQuestion[]>>('/sleep-assessment/questions'),
        ]);

        if (!orderRes.success || !orderRes.data) {
          setError('Failed to load order information');
          setIsLoading(false);
          return;
        }

        // Check payment status with retry logic
        if (orderRes.data.paymentStatus !== 'paid') {
          // Retry once after 2 seconds in case of database delay
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const retryOrderRes = await axiosInstance.get<unknown, ApiResponse<IDriftOffOrder>>(
            `/drift-off/orders/${orderIdToLoad}`,
          );

          if (retryOrderRes.success && retryOrderRes.data?.paymentStatus === 'paid') {
            // Payment confirmed on retry
          } else {
            setError('Payment verification in progress. Please wait a moment and refresh.');
            setIsLoading(false);
            return;
          }
        } else {
          // Payment is confirmed, proceed with assessment
        }

        // Check if user has already completed the assessment (only check once)
        if (!hasCheckedRedirects) {
          try {
            const responseRes = await axiosInstance.get<unknown, ApiResponse<{ completedAt?: string }>>(
              `/drift-off/responses/order/${orderIdToLoad}`,
            );

            if (responseRes.success && responseRes.data?.completedAt) {
              setHasCheckedRedirects(true);
              // Assessment already completed — go straight to my-session page
              router.replace('/drift-off/my-session');
              return;
            }
          } catch {
            // No existing response found, proceeding with assessment
          }
          setHasCheckedRedirects(true);
        }

        if (questionsRes.success) {
          setQuestions(questionsRes.data || []);
        } else {
          setError('Failed to load assessment questions');
        }
      } catch {
        setError('Failed to load the assessment. Please try again.');
      } finally {
        setIsLoading(false);
        setIsRedirecting(false);
      }
    },
    [hasCheckedRedirects, router],
  );

  const loadData = useCallback(async () => {
    // Track current URL to detect loops
    const url = window.location.href;
    if (url === currentUrl && hasCheckedRedirects) {
      console.warn('Same URL and already checked redirects - stopping to prevent loop');
      return;
    }
    setCurrentUrl(url);

    // Prevent multiple simultaneous loads and redirects
    if (isRedirecting) {
      return;
    }

    if (!orderId) {
      // Try to find a recent paid order for this user

      // Only check for redirects once
      if (hasCheckedRedirects) {
        setError('No order found. Please start from the beginning.');
        setIsLoading(false);
        return;
      }

      setIsRedirecting(true);
      setHasCheckedRedirects(true);

      // Try to find a recent paid order for this user
      try {
        const ordersRes = await axiosInstance.get<unknown, ApiResponse<IDriftOffOrder[]>>('/drift-off/orders');

        if (ordersRes.success && ordersRes.data) {
          const paidOrder = ordersRes.data.find((order) => order.paymentStatus === 'paid');
          if (paidOrder) {
            const newUrl = `/drift-off/assessment?orderId=${paidOrder._id}`;

            // Only redirect if it's a different URL
            if (url.includes(`orderId=${paidOrder._id}`)) {
              // Continue with loading this order
              return await loadOrderData(paidOrder._id);
            }

            router.replace(newUrl);
            return;
          }
        }
      } catch {
        // Failed to check recent orders
      }

      router.replace('/drift-off/payment');
      return;
    }

    // Load the specific order data
    await loadOrderData(orderId);
  }, [isRedirecting, hasCheckedRedirects, currentUrl, router, orderId, loadOrderData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Sidebar>
      <div className={styles.wrapper}>
        {isLoading && (
          <div className={styles.loading} aria-busy="true">
            <LottieLoader width={200} height={200} />
          </div>
        )}

        {!isLoading && error && (
          <div className={styles.error}>
            <div className={styles.errorContent}>
              <h3 className={styles.errorTitle}>Unable to Load Assessment</h3>
              <p className={styles.errorMessage}>{error}</p>
              <div className={styles.errorActions}>
                <button type="button" className={styles.retryBtn} onClick={() => window.location.reload()}>
                  Try Again
                </button>
                <button type="button" className={styles.backBtn} onClick={() => router.replace('/drift-off/payment')}>
                  Back to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && orderId && questions.length === 0 && (
          <div className={styles.empty}>
            <p>Assessment questions are currently being updated. Please check back later.</p>
          </div>
        )}

        {!isLoading && !error && orderId && questions.length > 0 && (
          <DriftOffAssessmentContainer questions={questions} driftOffOrderId={orderId} />
        )}
      </div>
    </Sidebar>
  );
}
