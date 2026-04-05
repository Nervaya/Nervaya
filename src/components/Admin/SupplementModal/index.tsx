'use client';

import React, { useState } from 'react';
import { AdminModal } from '../common';
import { SupplementFormData } from '@/types/supplement.types';
import SupplementForm from '../SupplementForm';
import styles from './styles.module.css';

const DEFAULT_FORM_DATA: SupplementFormData = {
  name: '',
  description: '',
  price: 0,
  image: '',
  stock: 0,
  ingredients: [],
  benefits: [],
  isActive: true,
};

interface SupplementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
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
  const [formData, setFormData] = useState<SupplementFormData | null>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });

  const handleSubmit = async () => {
    await onSubmit();
    onClose();
  };

  if (!formData) return null;

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="720px">
      <div className={styles.modalContent}>
        <p className={styles.subtitle}>Fill in the details below</p>
        <SupplementForm
          key={(initialData as { _id?: string })?._id ?? (isOpen ? 'new' : 'closed')}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          initialData={initialData}
          loading={loading}
          submitLabel={submitLabel}
        />
      </div>
    </AdminModal>
  );
};

export default SupplementModal;
