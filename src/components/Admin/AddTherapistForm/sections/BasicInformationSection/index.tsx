import { ICON_INFO } from '@/constants/icons';
import { GENDER_OPTIONS } from '@/lib/utils/therapist.utils';
import { FormSection } from '../FormSection';
import fieldStyles from '../../fieldStyles.module.css';
import styles from './styles.module.css';
import type { TherapistFormFieldsProps } from '../../formData';

export function BasicInformationSection({ formData, onChange }: TherapistFormFieldsProps) {
  return (
    <FormSection title="Basic Information" icon={ICON_INFO}>
      <div className={styles.content}>
        <div className={fieldStyles.formRow}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label} htmlFor="name">
              Full Name <span className={fieldStyles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              className={fieldStyles.input}
              placeholder="Dr. John Smith"
            />
          </div>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              className={fieldStyles.input}
              placeholder="john.smith@example.com"
            />
          </div>
        </div>

        <div className={fieldStyles.formRow}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label} htmlFor="experience">
              Experience <span className={fieldStyles.required}>*</span>
            </label>
            <input
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={onChange}
              required
              className={fieldStyles.input}
              placeholder="10+ years"
            />
          </div>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label} htmlFor="gender">
              Gender <span className={fieldStyles.required}>*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={onChange}
              required
              className={fieldStyles.input}
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
