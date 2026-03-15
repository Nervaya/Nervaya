import type { ChangeEvent, RefObject } from 'react';
import { Icon } from '@iconify/react';
import { ICON_TAG, ICON_UPLOAD } from '@/constants/icons';
import { FormSection } from '../FormSection';
import fieldStyles from '../../fieldStyles.module.css';
import styles from './styles.module.css';
import type { TherapistFormFieldsProps } from '../../formData';

interface PricingMediaSectionProps extends TherapistFormFieldsProps {
  videoInputRef: RefObject<HTMLInputElement | null>;
  videoUploading: boolean;
  onVideoUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function PricingMediaSection({
  formData,
  onChange,
  onVideoUpload,
  videoInputRef,
  videoUploading,
}: PricingMediaSectionProps) {
  return (
    <FormSection title="Pricing & Media" icon={ICON_TAG}>
      <div className={styles.content}>
        <div className={fieldStyles.formRow}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label} htmlFor="sessionFee">
              Session Fee (INR)
            </label>
            <input
              id="sessionFee"
              name="sessionFee"
              type="number"
              min="0"
              value={formData.sessionFee}
              onChange={onChange}
              className={fieldStyles.input}
              placeholder="1600"
            />
          </div>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label} htmlFor="sessionDurationMins">
              Session Duration (Minutes)
            </label>
            <input
              id="sessionDurationMins"
              name="sessionDurationMins"
              type="number"
              min="0"
              value={formData.sessionDurationMins}
              onChange={onChange}
              className={fieldStyles.input}
              placeholder="40"
            />
          </div>
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label} htmlFor="introVideoUrl">
            Intro Video URL
          </label>
          <input
            id="introVideoUrl"
            name="introVideoUrl"
            value={formData.introVideoUrl}
            onChange={onChange}
            className={fieldStyles.input}
            placeholder="https://...mp4"
          />
          <div className={styles.uploadActions}>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={onVideoUpload}
              hidden
            />
            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => videoInputRef.current?.click()}
              disabled={videoUploading}
            >
              <span className={styles.buttonContent}>
                <Icon icon={ICON_UPLOAD} />
                <span>{videoUploading ? 'Uploading video...' : 'Upload Intro Video'}</span>
              </span>
            </button>
          </div>
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label} htmlFor="introVideoThumbnail">
            Intro Video Thumbnail URL
          </label>
          <input
            id="introVideoThumbnail"
            name="introVideoThumbnail"
            value={formData.introVideoThumbnail}
            onChange={onChange}
            className={fieldStyles.input}
            placeholder="https://...jpg"
          />
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label} htmlFor="galleryImages">
            Gallery Images
          </label>
          <input
            id="galleryImages"
            name="galleryImages"
            value={formData.galleryImages}
            onChange={onChange}
            className={fieldStyles.input}
            placeholder="https://img1, https://img2"
          />
          <span className={fieldStyles.hint}>Comma separated URLs</span>
        </div>
      </div>
    </FormSection>
  );
}
