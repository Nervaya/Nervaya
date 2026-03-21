'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
import { IDriftOffResponse } from '@/types/driftOff.types';
import { ICON_HEADPHONES, ICON_CLOCK } from '@/constants/icons';
import type { VideoPlayerProps } from '@/components/DeepRest/VideoPlayer';
import styles from './SessionCard.module.css';

const VideoPlayerDynamic = dynamic(() => import('@/components/DeepRest/VideoPlayer'), {
  ssr: false,
}) as React.ComponentType<VideoPlayerProps>;

interface SessionCardProps {
  session: IDriftOffResponse;
  hasMounted: boolean;
  isRequesting: boolean;
  requestError?: string;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, hasMounted, isRequesting, requestError }) => {
  const videoUrl = session.assignedVideoUrl;
  const isReady = Boolean(videoUrl);
  const isPendingAssessment = !session.completedAt;
  const isPreparing = session.completedAt && !session.assignedVideoUrl;
  const hasRequestedReSession = Boolean(session.reSessionRequestedAt);
  const hasPendingReSessionRequest = Boolean(session.reSessionRequestedAt && !session.reSessionResolvedAt);
  const hasResolvedReSessionRequest = Boolean(session.reSessionRequestedAt && session.reSessionResolvedAt);

  return (
    <div className={styles.sessionCard}>
      <div className={styles.cardHeader}>
        <div className={styles.dateInfo}>
          <span className={styles.dateLabel}>Purchased on</span>
          <span className={styles.dateValue}>{new Date(session.createdAt).toLocaleDateString()}</span>
        </div>
        <div
          className={`${styles.statusBadge} ${
            hasPendingReSessionRequest
              ? styles.statusRequested
              : isReady
                ? styles.statusReady
                : isPreparing
                  ? styles.statusPreparing
                  : styles.statusPending
          }`}
        >
          {hasPendingReSessionRequest
            ? 'Re-Session Requested'
            : isReady
              ? 'Ready'
              : isPreparing
                ? 'Preparing'
                : 'Pending Action'}
        </div>
      </div>

      <div className={styles.cardContent}>
        {isReady ? (
          <div className={styles.videoContainer}>
            {hasMounted && (
              <VideoPlayerDynamic
                url={videoUrl ?? ''}
                width="100%"
                height="100%"
                controls
                className={styles.videoPlayer}
              />
            )}
          </div>
        ) : (
          <div className={styles.placeholderBox}>
            <Icon
              icon={isPreparing ? ICON_CLOCK : ICON_HEADPHONES}
              width={40}
              height={40}
              className={styles.placeholderIcon}
            />
            <p className={styles.placeholderText}>
              {isPreparing
                ? 'Our specialists are crafting your session...'
                : 'Complete your assessment to get started.'}
            </p>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        {isPendingAssessment && (
          <Link href={`/deep-rest/assessment?orderId=${session.driftOffOrderId}`} className={styles.actionBtn}>
            Complete Assessment
          </Link>
        )}
        {isPreparing && <p className={styles.preparationNote}>Expected in 1-2 days</p>}
        {isReady && (
          <>
            {!hasRequestedReSession && <p className={styles.readyNote}>Enjoy your personalized Deep Rest session.</p>}
            {(!hasRequestedReSession || isRequesting) && (
              <Link
                href={`/deep-rest/assessment?orderId=${session.driftOffOrderId}&mode=re-session`}
                className={styles.requestBtn}
                style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}
              >
                {isRequesting ? 'Requesting…' : 'Edit Answers & Re-Request'}
              </Link>
            )}
            {hasPendingReSessionRequest && !isRequesting && (
              <p className={styles.statusBadge} style={{ width: '100%', margin: '0', textAlign: 'center' }}>
                Re-Session Requested
              </p>
            )}
            {hasResolvedReSessionRequest && (
              <p className={styles.statusBadge} style={{ width: '100%', margin: '0', textAlign: 'center' }}>
                Re-Session Used
              </p>
            )}
          </>
        )}
        {isReady && hasPendingReSessionRequest && (
          <p className={styles.requestPendingNote}>
            Re-session requested on {new Date(session.reSessionRequestedAt as Date).toLocaleDateString()}. Our team will
            assign a replacement video soon.
          </p>
        )}
        {isReady && hasResolvedReSessionRequest && (
          <p className={styles.reassignedNote}>
            Your replacement session has been assigned. Re-session requests are limited to one per purchased session.
          </p>
        )}
        {requestError && <p className={styles.requestError}>{requestError}</p>}
      </div>
    </div>
  );
};
