'use client';

import React from 'react';
import { AdminModal } from '../common';
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
  const handleSubmit = async (data: SupplementFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="540px">
      <div className={styles.modalContent}>
        <p className={styles.subtitle}>Fill in the details below</p>
        <SupplementForm
          key={(initialData as { _id?: string })?._id ?? (isOpen ? 'new' : 'closed')}
          onSubmit={handleSubmit}
          initialData={initialData}
          loading={loading}
          submitLabel={submitLabel}
          compact
        />
      </div>
    </AdminModal>
  );
};

export default SupplementModal;
