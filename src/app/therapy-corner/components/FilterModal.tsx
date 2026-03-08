import React from 'react';
import { Icon } from '@iconify/react';
import { ICON_CLOSE } from '@/constants/icons';
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
            <Icon icon={ICON_CLOSE} width={18} height={18} />
          </button>
        </div>

        <div className={styles.filterFields}>
          <label className={styles.filterField}>
            <span>Language</span>
            <select
              className={styles.filterSelect}
              value={state.language}
              onChange={(e) => onStateChange('language', e.target.value)}
            >
              <option value="">All Languages</option>
              {options.languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span>Specialization</span>
            <select
              className={styles.filterSelect}
              value={state.specialization}
              onChange={(e) => onStateChange('specialization', e.target.value)}
            >
              <option value="">All Specializations</option>
              {options.specializations.map((specialization) => (
                <option key={specialization} value={specialization}>
                  {specialization}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span>Gender</span>
            <select
              className={styles.filterSelect}
              value={state.gender}
              onChange={(e) => onStateChange('gender', e.target.value)}
            >
              <option value="">Any Gender</option>
              {options.genders.map((gender) => (
                <option key={gender} value={gender}>
                  {formatGender(gender)}
                </option>
              ))}
            </select>
          </label>
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
