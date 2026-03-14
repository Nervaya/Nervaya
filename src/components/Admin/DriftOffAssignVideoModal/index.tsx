'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { ICON_X } from '@/constants/icons';
import styles from './styles.module.css';

interface DriftOffAssignVideoModalProps {
  responseId: string;
  userId: string;
  existingVideoUrl?: string;
  onClose: () => void;
  onAssign: (responseId: string, videoUrl: string) => Promise<void>;
}

const DriftOffAssignVideoModal = ({
  responseId,
  userId,
  existingVideoUrl = '',
  onClose,
  onAssign,
}: DriftOffAssignVideoModalProps) => {
  const [videoUrl, setVideoUrl] = useState(existingVideoUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setVideoUrl(existingVideoUrl || '');
  }, [existingVideoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = videoUrl.trim();
    if (!trimmed) {
      setError('Please provide a video URL');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onAssign(responseId, trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Assign video">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Assign Video</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <Icon icon={ICON_X} width={20} height={20} />
          </button>
        </div>
        <p className={styles.modalSubtitle}>
          User ID: <code className={styles.userId}>{userId}</code>
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="video-url" className={styles.label}>
            Video URL (YouTube, Vimeo, or direct link)
          </label>
          <input
            id="video-url"
            type="url"
            className={styles.input}
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl ?? ''}
            onChange={(e) => setVideoUrl(e.target.value ?? '')}
            required
          />

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Assigning…' : 'Assign Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriftOffAssignVideoModal;
