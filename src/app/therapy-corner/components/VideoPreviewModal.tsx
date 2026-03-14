import React from 'react';
import { Icon } from '@iconify/react';
import { ICON_X } from '@/constants/icons';
import { Therapist } from '@/types/therapist.types';
import styles from '../styles.module.css';

interface VideoPreviewModalProps {
  therapist: Therapist | null;
  onClose: () => void;
}

export function VideoPreviewModal({ therapist, onClose }: VideoPreviewModalProps) {
  if (!therapist?.introVideoUrl) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.videoModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{therapist.name} - Intro Video</h3>
          <button type="button" className={styles.closeModalBtn} onClick={onClose} aria-label="Close video">
            <Icon icon={ICON_X} width={18} height={18} />
          </button>
        </div>
        <video className={styles.videoPlayer} controls autoPlay poster={therapist.introVideoThumbnail || ''}>
          <source src={therapist.introVideoUrl} />
        </video>
      </div>
    </div>
  );
}
