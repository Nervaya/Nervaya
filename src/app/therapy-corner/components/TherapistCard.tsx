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
}

export function TherapistCard({
  therapist,
  onViewProfile,
  onBookAppointment,
  onVideoPreview,
  formatExperience,
}: TherapistCardProps) {
  return (
    <li className={styles.therapistCard} onMouseEnter={() => onViewProfile(therapist)}>
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
                  <div className={styles.videoFallback}>Intro Video</div>
                )}
                <span className={styles.videoOverlay}>
                  <Icon icon={ICON_PLAY} width={18} height={18} />
                  Watch video
                </span>
              </button>
            ) : therapist.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={therapist.image} alt={therapist.name} className={styles.mediaImage} />
            ) : (
              <div className={styles.videoFallback}>No Image</div>
            )}
          </div>

          <div className={styles.therapistText}>
            <div className={styles.titleRow}>
              {therapist.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={therapist.image} alt={`${therapist.name} profile`} className={styles.profileThumb} />
              ) : null}
              <h3>{therapist.name}</h3>
            </div>
            <p className={styles.credentials}>{therapist.qualifications?.join(', ') || 'Professional Therapist'}</p>
            <p className={styles.experienceText}>{formatExperience(therapist.experience)}</p>
            {therapist.sessionFee && therapist.sessionDurationMins ? (
              <p className={styles.feeText}>
                ₹{therapist.sessionFee} for {therapist.sessionDurationMins} mins
              </p>
            ) : null}
            <p className={styles.metaLine}>
              <span>Speaks</span>
              {therapist.languages?.join(', ') || 'N/A'}
            </p>
            <div className={styles.tags}>
              <SpecializationMarquee items={therapist.specializations || []} />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link
            href={`/therapy-corner/${therapist._id}`}
            className={styles.secondaryBtn}
            onClick={() => onViewProfile(therapist)}
          >
            View Profile
          </Link>
          <button className={styles.primaryBtn} onClick={() => onBookAppointment(therapist)}>
            Book Appointment
          </button>
        </div>
      </div>
    </li>
  );
}
