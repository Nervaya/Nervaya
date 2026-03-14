import React from 'react';
import { Icon } from '@iconify/react';
import { ICON_X } from '@/constants/icons';
import { CustomDropdown } from '@/components/common/CustomDropdown';
import styles from '../styles.module.css';

export interface FilterOptions {
  languages: string[];
  specializations: string[];
  genders: string[];
}

export interface FilterState {
  language: string;
  specialization: string;
  gender: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: FilterOptions;
  state: FilterState;
  onStateChange: (key: keyof FilterState, value: string) => void;
  onApply: () => void;
  onClear: () => void;
  formatGender: (gender: string) => string;
}

export function FilterModal({
  isOpen,
  onClose,
  options,
  state,
  onStateChange,
  onApply,
  onClear,
  formatGender,
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.filterModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Filter Therapists</h3>
          <button type="button" className={styles.closeModalBtn} onClick={onClose} aria-label="Close filters">
            <Icon icon={ICON_X} width={24} height={24} />
          </button>
        </div>

        <div className={styles.filterFields}>
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
              icon="lucide:languages"
            />
          </div>

          <div className={styles.filterField}>
            <span>Specialization</span>
            <CustomDropdown
              placeholder="All Specializations"
              value={state.specialization}
              onChange={(val) => onStateChange('specialization', val)}
              options={[
                { value: '', label: 'All Specializations' },
                ...options.specializations.map((spec) => ({ value: spec, label: spec })),
              ]}
              icon="lucide:brain"
            />
          </div>

          <div className={styles.filterField}>
            <span>Gender</span>
            <CustomDropdown
              placeholder="Any Gender"
              value={state.gender}
              onChange={(val) => onStateChange('gender', val)}
              options={[
                { value: '', label: 'Any Gender' },
                ...options.genders.map((gender) => ({ value: gender, label: formatGender(gender) })),
              ]}
              icon="lucide:user"
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
