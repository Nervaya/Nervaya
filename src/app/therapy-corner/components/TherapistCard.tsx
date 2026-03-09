import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { ICON_PLAY } from '@/constants/icons';
import { Therapist } from '@/types/therapist.types';
import { SpecializationMarquee } from './SpecializationMarquee';
import styles from '../styles.module.css';

interface TherapistCardProps {
  therapist: Therapist;
  onViewProfile: (therapist: Therapist) => void;
  onBookAppointment: (therapist: Therapist) => void;
  onVideoPreview: (therapist: Therapist) => void;
  formatExperience: (exp?: string) => string;
  nextSlotLabel?: string | null;
  isNextSlotLoading: boolean;
}

export function TherapistCard({
  therapist,
  onViewProfile,
  onBookAppointment,
  onVideoPreview,
  formatExperience,
  nextSlotLabel,
  isNextSlotLoading,
}: TherapistCardProps) {
  const nextSlotPrefix = 'Next online slot:';
  const nextSlotText = isNextSlotLoading ? 'Checking availability...' : nextSlotLabel || 'No upcoming online slot';

  return (
    <li className={styles.therapistCard}>
      <div className={styles.cardBody}>
        <div className={styles.therapistInfo}>
          <div className={styles.mediaCard}>
            {therapist.introVideoUrl ? (
              <button
                type="button"
                className={styles.videoPreviewButton}
                onClick={() => onVideoPreview(therapist)}
                aria-label={`Play intro video for ${therapist.name}`}
              >
                {therapist.introVideoThumbnail || therapist.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={therapist.introVideoThumbnail || therapist.image}
                    alt={`${therapist.name} video preview`}
                    className={styles.mediaImage}
                  />
                ) : (
                  <div className={styles.videoFallback}>
                    <Icon icon="ph:video-camera-bold" width={32} />
                    <span>Intro Video</span>
                  </div>
                )}
                <span className={styles.videoOverlay}>
                  <Icon icon={ICON_PLAY} width={14} height={14} />
                  Watch intro
                </span>
              </button>
            ) : therapist.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={therapist.image} alt={therapist.name} className={styles.mediaImage} />
            ) : (
              <div className={styles.videoFallback}>
                <Icon icon="ph:user-bold" width={40} />
                <span>No Image</span>
              </div>
            )}
          </div>

          <div className={styles.therapistText}>
            <div className={styles.titleRow}>
              <h3>{therapist.name}</h3>
            </div>
            <p className={styles.credentials}>{therapist.qualifications?.join(', ') || 'Professional Therapist'}</p>
            <div className={styles.metaInfoRow}>
              <span className={styles.experienceText}>
                <Icon icon="ph:briefcase-bold" />
                {formatExperience(therapist.experience)}
              </span>
              {therapist.sessionFee && therapist.sessionDurationMins ? (
                <span className={styles.feeText}>₹{therapist.sessionFee}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className={styles.cardMeta}>
          <div className={styles.expertiseRow}>
            <span className={styles.expertiseLabel}>Expertise</span>
            <div className={styles.tags}>
              <SpecializationMarquee items={therapist.specializations || []} />
            </div>
          </div>
          <p className={styles.speaksLine}>
            <Icon icon="ph:translate-bold" />
            <span>{therapist.languages?.join(', ') || 'English'}</span>
          </p>
        </div>

        <div className={styles.availabilitySection}>
          <p className={styles.nextSlotLine}>
            <span className={styles.statusDot} />
            {nextSlotPrefix}{' '}
            <span className={nextSlotLabel ? styles.nextSlotValue : styles.nextSlotFallback}>{nextSlotText}</span>
          </p>
        </div>

        <div className={styles.actions}>
          <Link
            href={`/therapy-corner/${therapist._id}`}
            className={styles.secondaryBtn}
            onClick={() => onViewProfile(therapist)}
          >
            Profile
          </Link>
          <button className={styles.primaryBtn} onClick={() => onBookAppointment(therapist)}>
            Book Now
          </button>
        </div>
      </div>
    </li>
  );
}
