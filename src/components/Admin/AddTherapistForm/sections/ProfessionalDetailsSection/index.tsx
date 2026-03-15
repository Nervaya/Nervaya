import { ICON_RECEIPT } from '@/constants/icons';
import { FormSection } from '../FormSection';
import fieldStyles from '../../fieldStyles.module.css';
import styles from './styles.module.css';
import type { TherapistFormFieldsProps } from '../../formData';

export function ProfessionalDetailsSection({ formData, onChange }: TherapistFormFieldsProps) {
  return (
    <FormSection title="Professional Details" icon={ICON_RECEIPT}>
      <div className={styles.content}>
        <div className={fieldStyles.formRow}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label} htmlFor="qualifications">
              Qualifications <span className={fieldStyles.required}>*</span>
            </label>
            <input
              id="qualifications"
              name="qualifications"
              value={formData.qualifications}
              onChange={onChange}
              required
              className={fieldStyles.input}
              placeholder="M.A. Psychology, Licensed Therapist"
            />
            <span className={fieldStyles.hint}>Comma separated</span>
          </div>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label} htmlFor="specializations">
              Specializations <span className={fieldStyles.required}>*</span>
            </label>
            <input
              id="specializations"
              name="specializations"
              value={formData.specializations}
              onChange={onChange}
              required
              className={fieldStyles.input}
              placeholder="Anxiety, Depression, Sleep Disorders"
            />
            <span className={fieldStyles.hint}>Comma separated</span>
          </div>
        </div>

        <div className={fieldStyles.formRow}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label} htmlFor="languages">
              Languages <span className={fieldStyles.required}>*</span>
            </label>
            <input
              id="languages"
              name="languages"
              value={formData.languages}
              onChange={onChange}
              required
              className={fieldStyles.input}
              placeholder="English, Hindi"
            />
            <span className={fieldStyles.hint}>Comma separated</span>
          </div>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label} htmlFor="sessionModes">
              Session Modes
            </label>
            <input
              id="sessionModes"
              name="sessionModes"
              value={formData.sessionModes}
              onChange={onChange}
              className={fieldStyles.input}
              placeholder="Video, Audio, In-person"
            />
            <span className={fieldStyles.hint}>Comma separated</span>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
