'use client';

import React, { useState, useEffect } from 'react';
import { Supplement, SupplementFormData } from '@/types/supplement.types';
import SupplementList from '@/components/Admin/SupplementList';
import SupplementModal from '@/components/Admin/SupplementModal';
import api from '@/lib/axios';
import styles from './styles.module.css';

export default function AdminSupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await api.get('/supplements?admin=true')) as {
        success: boolean;
        data: Supplement[];
      };
      if (response.success && response.data) {
        setSupplements(response.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load supplements',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = (await api.delete(`/supplements/${id}`)) as {
        success: boolean;
      };
      if (response.success) {
        fetchSupplements();
      } else {
        setError('Failed to delete supplement');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete supplement',
      );
    }
  };

  const handleAdd = () => {
    setEditingSupplement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSupplement(null);
  };

  const handleSubmit = async (data: SupplementFormData) => {
    setSubmitting(true);
    try {
      if (editingSupplement) {
        const response = (await api.put(
          `/supplements/${editingSupplement._id}`,
          data,
        )) as { success: boolean };
        if (response.success) {
          fetchSupplements();
          handleModalClose();
        } else {
          setError('Failed to update supplement');
          throw new Error('Failed to update supplement');
        }
      } else {
        const response = (await api.post('/supplements', data)) as {
          success: boolean;
        };
        if (response.success) {
          fetchSupplements();
          handleModalClose();
        } else {
          setError('Failed to create supplement');
          throw new Error('Failed to create supplement');
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save supplement',
      );
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSupplements();
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Manage Supplements</h2>
          <button onClick={handleAdd} className={styles.addButton}>
            Add New Supplement
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <SupplementList
          supplements={supplements}
          onDelete={handleDelete}
          onEdit={handleEdit}
          loading={loading}
        />
      </div>

      <SupplementModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        initialData={editingSupplement || undefined}
        loading={submitting}
        title={editingSupplement ? 'Edit Supplement' : 'Add New Supplement'}
        submitLabel={
          editingSupplement ? 'Update Supplement' : 'Create Supplement'
        }
      />
    </>
  );
}
