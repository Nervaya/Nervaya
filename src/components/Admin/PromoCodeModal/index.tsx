'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaXmark } from 'react-icons/fa6';
import type { CreatePromoCodeDto, PromoCode } from '@/types/supplement.types';
import PromoCodeForm from '../PromoCodeForm';
import styles from './styles.module.css';

interface PromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePromoCodeDto) => Promise<void>;
  initialData?: PromoCode | null;
  loading?: boolean;
  title: string;
  submitLabel?: string;
}

const PromoCodeModal: React.FC<PromoCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  title,
  submitLabel = 'Create Promo Code',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (data: CreatePromoCodeDto) => {
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
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal" title="Close">
            <FaXmark className={styles.closeIcon} />
          </button>
        </div>
        <div className={styles.content}>
          <PromoCodeForm
            key={initialData?._id ?? (isOpen ? 'new' : 'closed')}
            onSubmit={handleSubmit}
            initialData={initialData ?? null}
            loading={loading}
            submitLabel={submitLabel}
          />
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default PromoCodeModal;
