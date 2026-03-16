'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { Icon } from '@iconify/react';
import { ICON_ARROW_DOWN, ICON_CHECK } from '@/constants/icons';
import styles from './Dropdown.module.css';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  ariaLabel,
  id,
  disabled = false,
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const triggerId = id ?? `dropdown-${generatedId.replace(/:/g, '')}`;

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        open &&
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !contentRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div className={`${styles.root} ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        disabled={disabled}
      >
        <span className={styles.triggerValue}>{displayLabel}</span>
        <Icon
          icon={ICON_ARROW_DOWN}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          aria-hidden
          width={20}
          height={20}
        />
      </button>
      {open && (
        <div
          ref={contentRef}
          role="listbox"
          aria-labelledby={triggerId}
          className={styles.content}
          aria-activedescendant={value ? `dropdown-option-${triggerId}-${value}` : undefined}
        >
          {options.map((opt) => {
            const isSelected = value === opt.value;
            const optionId = `dropdown-option-${triggerId}-${opt.value}`;
            return (
              <div
                key={`${opt.value}-${opt.label}`}
                id={optionId}
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                onClick={() => handleSelect(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(opt.value);
                  }
                }}
              >
                <span className={styles.optionLabel}>{opt.label}</span>
                {isSelected && <Icon icon={ICON_CHECK} className={styles.check} aria-hidden width={16} height={16} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
