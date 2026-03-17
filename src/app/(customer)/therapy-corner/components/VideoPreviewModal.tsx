import React from 'react';
import { Icon } from '@iconify/react';
import { ICON_X } from '@/constants/icons';
import { Therapist } from '@/types/therapist.types';
import styles from '../styles.module.css';
import { getEmbedUrl } from '@/lib/utils/video.utils';

interface VideoPreviewModalProps {
  therapist: Therapist | null;
  onClose: () => void;
}

export function VideoPreviewModal({ therapist, onClose }: VideoPreviewModalProps) {
  if (!therapist?.introVideoUrl) return null;

  const embedUrl = getEmbedUrl(therapist.introVideoUrl);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.videoModal} key={therapist._id} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{therapist.name} - Intro Video</h3>
          <button type="button" className={styles.closeModalBtn} onClick={onClose} aria-label="Close video">
            <Icon icon={ICON_X} width={18} height={18} />
          </button>
        </div>
        {embedUrl ? (
          <iframe
            className={styles.videoPlayer}
            src={embedUrl}
            title={`${therapist.name} - Intro Video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className={styles.videoPlayer}
            controls
            autoPlay
            poster={therapist.introVideoThumbnail || therapist.image || ''}
            src={therapist.introVideoUrl}
          >
            <source src={therapist.introVideoUrl} />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
}
