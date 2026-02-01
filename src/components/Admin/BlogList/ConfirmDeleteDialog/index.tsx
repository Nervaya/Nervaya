'use client';

import styles from './styles.module.css';

interface ConfirmDeleteDialogProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({ title, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmDialog}>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.</p>
        <div className={styles.confirmActions}>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Delete
          </button>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
