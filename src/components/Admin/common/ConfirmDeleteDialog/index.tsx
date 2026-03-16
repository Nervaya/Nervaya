'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import AdminModal from '../AdminModal';
import styles from './ConfirmDeleteDialog.module.css';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
}

export default function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDeleting = false,
}: ConfirmDeleteDialogProps) {
  const footer = (
    <>
      <button className={styles.cancelBtn} onClick={onClose} disabled={isDeleting}>
        {cancelText}
      </button>
      <button className={styles.deleteBtn} onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : confirmText}
      </button>
    </>
  );

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title="" footer={footer} maxWidth="400px">
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <AlertTriangle className={styles.warningIcon} />
        </div>
        <div className={styles.textContent}>
          <h3 className={styles.modalTitle}>Confirm Delete</h3>
          <p className={styles.message}>
            {message || `Are you sure you want to delete "${title}"? This action cannot be undone.`}
          </p>
        </div>
      </div>
    </AdminModal>
  );
}
