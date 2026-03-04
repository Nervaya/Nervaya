'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import LottieLoader from '@/components/common/LottieLoader';
import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '@/lib/utils/response.util';
import type { IDriftOffResponse } from '@/types/driftOff.types';
import styles from './styles.module.css';

export default function DriftOffWaitingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [response, setResponse] = useState<IDriftOffResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.replace('/drift-off/payment');
      return;
    }

    const checkStatus = async () => {
      // Prevent multiple redirects
      if (isRedirecting) {
        return;
      }

      try {
        const responseRes = await axiosInstance.get<unknown, ApiResponse<IDriftOffResponse>>(
          `/drift-off/responses/order/${orderId}`,
        );

        if (responseRes.success && responseRes.data?.assignedVideoUrl) {
          setIsRedirecting(true);
          router.replace(`/drift-off/session?orderId=${orderId}`);
          return;
        }

        setResponse(responseRes.data || null);
      } catch (err) {
        // Check if it's a 404 (no response exists)
        if (err instanceof Error && err.message.includes('404')) {
          setIsRedirecting(true);
          router.replace(`/drift-off/assessment?orderId=${orderId}`);
        } else {
          setError('Failed to check your session status');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();

    // Poll for updates every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [orderId, router, isRedirecting]);

  const handleCompleteAssessment = () => {
    router.push(`/drift-off/assessment?orderId=${orderId}`);
  };

  if (isLoading) {
    return (
      <Sidebar>
        <div className={styles.wrapper}>
          <div className={styles.loading} aria-busy="true">
            <LottieLoader width={200} height={200} />
          </div>
        </div>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <div className={styles.wrapper}>
          <div className={styles.error}>
            <p>{error}</p>
            <button type="button" className={styles.retryBtn} onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className={styles.wrapper}>
        <div className={styles.waitingContainer}>
          <div className={styles.waitingCard}>
            <div className={styles.waitingHeader}>
              <div className={styles.icon}>🌙</div>
              <h1 className={styles.title}>Your Deep Rest Session is Being Prepared</h1>
              <p className={styles.subtitle}>
                Thank you for completing your assessment. Our team is carefully reviewing your responses to create a
                personalized session just for you.
              </p>
            </div>

            <div className={styles.statusSection}>
              <div className={styles.statusItem}>
                <div className={`${styles.statusDot} ${styles.completed}`}></div>
                <span className={styles.statusText}>Payment Completed</span>
              </div>
              <div className={styles.statusItem}>
                <div
                  className={`${styles.statusDot} ${response?.completedAt ? styles.completed : styles.active}`}
                ></div>
                <span className={styles.statusText}>
                  {response?.completedAt ? 'Assessment Completed' : 'Assessment in Progress'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <div
                  className={`${styles.statusDot} ${response?.assignedVideoUrl ? styles.completed : styles.pending}`}
                ></div>
                <span className={styles.statusText}>
                  {response?.assignedVideoUrl ? 'Session Ready' : 'Personalized Session Creation'}
                </span>
              </div>
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>What happens next?</h3>
                <ul className={styles.infoList}>
                  <li>Our sleep specialists review your assessment responses</li>
                  <li>We create a personalized Deep Rest Session based on your needs</li>
                  <li>Your session will be available within 24-48 hours</li>
                  <li>You&apos;ll receive access to your custom session here</li>
                </ul>
              </div>

              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>While you wait...</h3>
                <ul className={styles.infoList}>
                  <li>Practice gentle breathing exercises before bed</li>
                  <li>Keep your bedroom cool and dark</li>
                  <li>Avoid screens 1 hour before sleep</li>
                  <li>Try our free relaxation resources</li>
                </ul>
              </div>
            </div>

            {!response?.completedAt && (
              <div className={styles.actionSection}>
                <p className={styles.actionText}>Haven&apos;t completed your assessment yet?</p>
                <button type="button" className={styles.actionBtn} onClick={handleCompleteAssessment}>
                  Complete Assessment
                </button>
              </div>
            )}

            <div className={styles.supportSection}>
              <p className={styles.supportText}>Need help? Contact our support team at support@nervaya.com</p>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
