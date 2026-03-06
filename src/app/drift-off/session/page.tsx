'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Sidebar from '@/components/Sidebar/LazySidebar';
import LottieLoader from '@/components/common/LottieLoader';
import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '@/lib/utils/response.util';
import type { IDriftOffResponse } from '@/types/driftOff.types';
import { ICON_MOON, ICON_HEADPHONES, ICON_BED, ICON_CLOSE, ICON_CLOCK } from '@/constants/icons';
import styles from './styles.module.css';

export default function DriftOffSessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [response, setResponse] = useState<IDriftOffResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.replace('/drift-off/payment');
      return;
    }

    const loadSession = async () => {
      try {
        const responseRes = await axiosInstance.get<unknown, ApiResponse<IDriftOffResponse>>(
          `/drift-off/responses/order/${orderId}`,
        );

        if (!responseRes.success) {
          setError('Failed to load session data');
          return;
        }

        if (!responseRes.data) {
          // No response exists, redirect to assessment
          router.replace(`/drift-off/assessment?orderId=${orderId}`);
          return;
        }

        if (!responseRes.data.assignedVideoUrl) {
          // No video assigned yet, redirect to waiting page
          router.replace(`/drift-off/waiting?orderId=${orderId}`);
          return;
        }

        setResponse(responseRes.data);
      } catch (err) {
        // Check if it's a 404 (no response exists)
        if (err instanceof Error && err.message.includes('404')) {
          router.replace(`/drift-off/assessment?orderId=${orderId}`);
        } else {
          setError('Failed to load your session. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [orderId, router]);

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
        <div className={styles.sessionContainer}>
          <div className={styles.sessionCard}>
            <div className={styles.sessionHeader}>
              <div className={styles.icon}>
                <Icon icon={ICON_MOON} width={40} height={40} />
              </div>
              <h1 className={styles.title}>Your Personalized Deep Rest Session</h1>
              <p className={styles.subtitle}>
                This session has been carefully crafted based on your assessment responses to help you achieve deep,
                restorative rest.
              </p>
            </div>

            <div className={styles.videoSection}>
              <div className={styles.videoContainer}>
                {response?.assignedVideoUrl && (
                  <video
                    controls
                    className={styles.videoPlayer}
                    poster="/images/drift-off-poster.jpg"
                    preload="metadata"
                  >
                    <source src={response.assignedVideoUrl} type="video/mp4" />
                    <source src={response.assignedVideoUrl} type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>

            <div className={styles.guidelinesSection}>
              <h2 className={styles.sectionTitle}>Session Guidelines</h2>
              <div className={styles.guidelinesGrid}>
                <div className={styles.guidelineCard}>
                  <div className={styles.guidelineIcon}>
                    <Icon icon={ICON_HEADPHONES} width={32} height={32} />
                  </div>
                  <h3 className={styles.guidelineTitle}>Use Headphones</h3>
                  <p className={styles.guidelineText}>
                    For the best experience, use comfortable headphones to fully immerse yourself.
                  </p>
                </div>
                <div className={styles.guidelineCard}>
                  <div className={styles.guidelineIcon}>
                    <Icon icon={ICON_BED} width={32} height={32} />
                  </div>
                  <h3 className={styles.guidelineTitle}>Find a Comfortable Position</h3>
                  <p className={styles.guidelineText}>
                    Lie down in a comfortable position where you won&apos;t be disturbed.
                  </p>
                </div>
                <div className={styles.guidelineCard}>
                  <div className={styles.guidelineIcon}>
                    <Icon icon={ICON_CLOSE} width={32} height={32} />
                  </div>
                  <h3 className={styles.guidelineTitle}>Minimize Distractions</h3>
                  <p className={styles.guidelineText}>Ensure your environment is quiet and free from interruptions.</p>
                </div>
                <div className={styles.guidelineCard}>
                  <div className={styles.guidelineIcon}>
                    <Icon icon={ICON_CLOCK} width={32} height={32} />
                  </div>
                  <h3 className={styles.guidelineTitle}>Allow Full Duration</h3>
                  <p className={styles.guidelineText}>
                    Give yourself the full time to experience the complete session.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.tipsSection}>
              <h2 className={styles.sectionTitle}>Tips for Better Results</h2>
              <ul className={styles.tipsList}>
                <li>Listen to this session at the same time each day for best results</li>
                <li>Don&apos;t worry if you fall asleep - that&apos;s perfectly natural!</li>
                <li>Keep a gentle, open attitude - don&apos;t try too hard</li>
                <li>You can replay this session anytime you need deep rest</li>
              </ul>
            </div>

            <div className={styles.supportSection}>
              <p className={styles.supportText}>
                If you experience any issues with your session, please contact us at support@nervaya.com and we&apos;ll
                be happy to help.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
