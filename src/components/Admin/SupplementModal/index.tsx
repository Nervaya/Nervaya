"use client";

import React, { useEffect, useRef } from "react";
import { SupplementFormData } from "@/types/supplement.types";
import SupplementForm from "../SupplementForm";
import styles from "./styles.module.css";

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
  submitLabel = "Create Supplement",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Prevent auto-close on Escape - require explicit close button click
        // Uncomment below if you want Escape to work with confirmation
        // const confirmed = window.confirm('Are you sure you want to close? Unsaved changes will be lost.');
        // if (confirmed) {
        //   onClose();
        // }
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Ensure modal is visible when opened
  useEffect(() => {
    if (isOpen && overlayRef.current) {
      // Scroll overlay to top to ensure header is visible
      overlayRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on overlay, not on modal content
    if (e.target === overlayRef.current) {
      // Prevent auto-close - require explicit close button click
      // Uncomment below if you want outside click to work with confirmation
      // const confirmed = window.confirm('Are you sure you want to close? Unsaved changes will be lost.');
      // if (confirmed) {
      //   onClose();
      // }
    }
  };

  const handleClose = () => {
    // Optional: Add confirmation dialog
    // const confirmed = window.confirm('Are you sure you want to close? Unsaved changes will be lost.');
    // if (confirmed) {
    //   onClose();
    // }
    onClose();
  };

  const handleSubmit = async (data: SupplementFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.title}>{title}</div>
            <p className={styles.subtitle}>Fill in the details below</p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close modal"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <SupplementForm
            onSubmit={handleSubmit}
            initialData={initialData}
            loading={loading}
            submitLabel={submitLabel}
          />
        </div>
      </div>
    </div>
  );
};

export default SupplementModal;
