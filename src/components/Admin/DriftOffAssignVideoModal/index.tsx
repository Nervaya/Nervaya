'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { ICON_LINK, ICON_FOLDER, ICON_UPLOAD, ICON_CHECK, ICON_CLOSE } from '@/constants/icons';
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
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setVideoUrl(existingVideoUrl || '');
  }, [existingVideoUrl]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid video file (MP4, WebM, or MOV)');
      return;
    }
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Video file must be smaller than 100MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('responseId', responseId);
      const uid = typeof userId === 'string' ? userId : (userId as { _id: string })._id;
      formData.append('userId', uid);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      const response = await fetch('/api/admin/drift-off/upload-video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.success) {
        setVideoUrl(result.data.videoUrl || '');
        setUploadMethod('url');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = videoUrl.trim();
    if (!trimmed) {
      setError('Please provide a video URL or upload a video file');
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
            <Icon icon={ICON_CLOSE} width={20} height={20} />
          </button>
        </div>
        <p className={styles.modalSubtitle}>
          User ID:{' '}
          <code className={styles.userId}>{typeof userId === 'string' ? userId : (userId as { _id: string })._id}</code>
        </p>

        <div className={styles.uploadMethodSelector}>
          <button
            type="button"
            className={`${styles.methodBtn} ${uploadMethod === 'url' ? styles.active : ''}`}
            onClick={() => setUploadMethod('url')}
          >
            <Icon icon={ICON_LINK} width={16} height={16} /> Video URL
          </button>
          <button
            type="button"
            className={`${styles.methodBtn} ${uploadMethod === 'file' ? styles.active : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            <Icon icon={ICON_FOLDER} width={16} height={16} /> Upload File
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {uploadMethod === 'url' ? (
            <>
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
            </>
          ) : (
            <>
              <label htmlFor="video-file" className={styles.label}>
                Upload Video File (MP4, WebM, MOV - Max 100MB)
              </label>
              <input
                ref={fileInputRef}
                id="video-file"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className={styles.fileInput}
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  `Uploading... ${uploadProgress}%`
                ) : (
                  <>
                    <Icon icon={ICON_UPLOAD} width={16} height={16} /> Choose File
                  </>
                )}
              </button>

              {isUploading && (
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                </div>
              )}

              {videoUrl && uploadMethod === 'file' && (
                <div className={styles.uploadSuccess}>
                  <Icon icon={ICON_CHECK} width={16} height={16} /> Video uploaded successfully!
                  <br />
                  <small>{videoUrl}</small>
                </div>
              )}
            </>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting || isUploading}>
              {isSubmitting ? 'Assigning…' : 'Assign Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriftOffAssignVideoModal;
