import { useRef } from 'react';
import { Icon } from '@iconify/react';
import { ICON_X, ICON_LANGUAGES, ICON_USER_LUCIDE } from '@/constants/icons';
import { CustomDropdown } from '@/components/common/CustomDropdown';
import { useModalDismiss } from '@/hooks/useModalDismiss';
import styles from '../styles.module.css';

import { FilterState } from '../page';
import MultiSelect from '@/components/common/MultiSelect/MultiSelect';

export interface FilterOptions {
  languages: string[];
  specializations: string[];
  genders: { label: string; value: string }[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: FilterOptions;
  state: FilterState;
  onStateChange: (key: keyof FilterState, value: FilterState[keyof FilterState]) => void;
  onApply: () => void;
  onClear: () => void;
}

export function FilterModal({ isOpen, onClose, options, state, onStateChange, onApply, onClear }: FilterModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalDismiss(isOpen, modalRef, onClose);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div ref={modalRef} className={styles.filterModal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h3>Filter Therapists</h3>
          <button type="button" className={styles.closeModalBtn} onClick={onClose} aria-label="Close filters">
            <Icon icon={ICON_X} width={24} height={24} />
          </button>
        </div>

        <div className={styles.filterFields}>
          <div className={styles.filterField}>
            <span>Qualification</span>
            <MultiSelect
              placeholder="Select Qualifications"
              values={state.specialization}
              onChange={(vals) => onStateChange('specialization', vals)}
              options={options.specializations.map((spec) => ({ value: spec, label: spec }))}
            />
          </div>

          <div className={styles.filterField}>
            <span>Language</span>
            <CustomDropdown
              placeholder="All Languages"
              value={state.language}
              onChange={(val) => onStateChange('language', val)}
              options={[
                { value: '', label: 'All Languages' },
                ...options.languages.map((lang) => ({ value: lang, label: lang })),
              ]}
              icon={ICON_LANGUAGES}
            />
          </div>

          <div className={styles.filterField}>
            <span>Gender</span>
            <CustomDropdown
              placeholder="Any Gender"
              value={state.gender}
              onChange={(val) => onStateChange('gender', val)}
              options={options.genders}
              icon={ICON_USER_LUCIDE}
            />
          </div>

          <div className={styles.filterField}>
            <span>Min Experience (Years)</span>
            <input
              type="number"
              min="0"
              value={state.minExperience}
              onChange={(e) => onStateChange('minExperience', e.target.value)}
              className={styles.modalNumericInput}
              placeholder="e.g. 5"
            />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalSecondaryBtn} onClick={onClear}>
            Clear
          </button>
          <button type="button" className={styles.modalPrimaryBtn} onClick={onApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
