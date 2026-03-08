'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import DriftOffAssessmentContainer from '@/components/DriftOff/DriftOffAssessmentContainer';
import LottieLoader from '@/components/common/LottieLoader';
import axiosInstance from '@/lib/axios';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import type { ApiResponse } from '@/lib/utils/response.util';
import type { IDriftOffAnswer, IDriftOffOrder } from '@/types/driftOff.types';
import styles from './styles.module.css';

export default function DriftOffAssessmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [questions, setQuestions] = useState<ISleepAssessmentQuestion[]>([]);
  const [initialAnswers, setInitialAnswers] = useState<IDriftOffAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasCheckedRedirectsRef = useRef(false);

  const fetchQuestionsWithRetry = useCallback(async (): Promise<ISleepAssessmentQuestion[]> => {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const questionsRes = await axiosInstance.get<unknown, ApiResponse<ISleepAssessmentQuestion[]>>(
        '/sleep-assessment/questions',
      );

      if (!questionsRes.success) {
        if (attempt === maxAttempts) {
          throw new Error('Failed to load assessment questions');
        }
      } else {
        const nextQuestions = questionsRes.data || [];
        if (nextQuestions.length > 0) {
          return nextQuestions;
        }
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }

    return [];
  }, []);

  const loadOrderData = useCallback(
    async (orderIdToLoad: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const orderRes = await axiosInstance.get<unknown, ApiResponse<IDriftOffOrder>>(
          `/drift-off/orders/${orderIdToLoad}`,
        );

        if (!orderRes.success || !orderRes.data) {
          setError('Failed to load order information');
          setIsLoading(false);
          return;
        }
        if (orderRes.data.paymentStatus !== 'paid') {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const retryOrderRes = await axiosInstance.get<unknown, ApiResponse<IDriftOffOrder>>(
            `/drift-off/orders/${orderIdToLoad}`,
          );

          if (retryOrderRes.success && retryOrderRes.data?.paymentStatus === 'paid') {
          } else {
            setError('Payment verification in progress. Please wait a moment and refresh.');
            setIsLoading(false);
            return;
          }
        } else {
        }

        try {
          const responseRes = await axiosInstance.get<
            unknown,
            ApiResponse<{ completedAt?: string; answers?: IDriftOffAnswer[] }>
          >(`/drift-off/responses/order/${orderIdToLoad}`);

          if (responseRes.success && responseRes.data?.completedAt) {
            hasCheckedRedirectsRef.current = true;
            router.replace('/drift-off/my-session');
            return;
          }

          setInitialAnswers(responseRes.data?.answers || []);
        } catch {
          setInitialAnswers([]);
        }
        hasCheckedRedirectsRef.current = true;

        const loadedQuestions = await fetchQuestionsWithRetry();
        if (loadedQuestions.length === 0) {
          setError('Unable to load assessment questions right now. Please try again in a few seconds.');
          return;
        }

        setQuestions(loadedQuestions);
      } catch {
        setError('Failed to load the assessment. Please try again.');
      } finally {
        setIsLoading(false);
        setIsRedirecting(false);
      }
    },
    [router, fetchQuestionsWithRetry],
  );

  const loadData = useCallback(async () => {
    const url = window.location.href;
    if (isRedirecting) {
      return;
    }

    if (!orderId) {
      if (hasCheckedRedirectsRef.current) {
        setError('No order found. Please start from the beginning.');
        setIsLoading(false);
        return;
      }

      setIsRedirecting(true);
      hasCheckedRedirectsRef.current = true;
      try {
        const ordersRes = await axiosInstance.get<unknown, ApiResponse<IDriftOffOrder[]>>('/drift-off/orders');

        if (ordersRes.success && ordersRes.data) {
          const paidOrder = ordersRes.data.find((order) => order.paymentStatus === 'paid');
          if (paidOrder) {
            const newUrl = `/drift-off/assessment?orderId=${paidOrder._id}`;
            if (url.includes(`orderId=${paidOrder._id}`)) {
              return await loadOrderData(paidOrder._id);
            }

            router.replace(newUrl);
            return;
          }
        }
      } catch {}

      router.replace('/drift-off/payment');
      return;
    }
    await loadOrderData(orderId);
  }, [isRedirecting, router, orderId, loadOrderData]);

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

        {!isLoading && !error && orderId && questions.length > 0 && (
          <DriftOffAssessmentContainer
            questions={questions}
            driftOffOrderId={orderId}
            initialAnswers={initialAnswers}
          />
        )}
      </div>
    </Sidebar>
  );
}
