'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaXmark } from 'react-icons/fa6';
import { SupplementFormData } from '@/types/supplement.types';
import SupplementForm from '../SupplementForm';
import styles from './styles.module.css';

interface SupplementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplementFormData) => Promise<void>;
  initialData?: Partial<SupplementFormData>;
  loading?: boolean;
  title: string;
  submitLabel?: string;
}

const SupplementModal: React.FC<SupplementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  title,
  submitLabel = 'Create Supplement',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
      }
    };

    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && overlayRef.current) {
      overlayRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (data: SupplementFormData) => {
    await onSubmit(data);
    onClose();
  };

  const modalContent = (
    <div ref={overlayRef} className={styles.overlay} onClick={handleOverlayClick}>
      <div ref={modalRef} className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.title}>{title}</div>
            <p className={styles.subtitle}>Fill in the details below</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close modal"
            title="Close"
          >
            <FaXmark className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          <SupplementForm
            key={(initialData as { _id?: string })?._id ?? (isOpen ? 'new' : 'closed')}
            onSubmit={handleSubmit}
            initialData={initialData}
            loading={loading}
            submitLabel={submitLabel}
            compact
          />
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }
  return createPortal(modalContent, document.body);
};

export default SupplementModal;
