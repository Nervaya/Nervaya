'use client';

import React, { useState, useEffect } from 'react';
import type { PromoCode, CreatePromoCodeDto } from '@/types/supplement.types';
import PromoCodeList from '@/components/Admin/PromoCodeList';
import PromoCodeModal from '@/components/Admin/PromoCodeModal';
import api from '@/lib/axios';
import styles from '../supplements/styles.module.css';

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await api.get('/promo')) as { success: boolean; data: PromoCode[] };
      if (response.success && response.data) {
        setPromoCodes(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = (await api.delete(`/promo/${id}`)) as { success: boolean };
      if (response.success) {
        fetchPromoCodes();
      } else {
        setError('Failed to delete promo code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promo code');
    }
  };

  const handleToggleActive = async (id: string) => {
    const promo = promoCodes.find((p) => p._id === id);
    if (!promo) return;
    try {
      const response = (await api.put(`/promo/${id}`, {
        isActive: !promo.isActive,
      })) as { success: boolean };
      if (response.success) {
        fetchPromoCodes();
      } else {
        setError('Failed to update promo code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update promo code');
    }
  };

  const handleAdd = () => {
    setEditingPromo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
  };

  const handleSubmit = async (data: CreatePromoCodeDto) => {
    setSubmitting(true);
    try {
      if (editingPromo) {
        const response = (await api.put(`/promo/${editingPromo._id}`, data)) as {
          success: boolean;
        };
        if (response.success) {
          fetchPromoCodes();
          handleModalClose();
        } else {
          setError('Failed to update promo code');
          throw new Error('Failed to update promo code');
        }
      } else {
        const response = (await api.post('/promo', data)) as { success: boolean };
        if (response.success) {
          fetchPromoCodes();
          handleModalClose();
        } else {
          setError('Failed to create promo code');
          throw new Error('Failed to create promo code');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save promo code');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Manage Promo Codes</h2>
          <button type="button" onClick={handleAdd} className={styles.addButton}>
            Add New Promo Code
          </button>
        </div>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}
        <PromoCodeList
          promoCodes={promoCodes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          loading={loading}
        />
      </div>

      <PromoCodeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        initialData={editingPromo ?? undefined}
        loading={submitting}
        title={editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}
        submitLabel={editingPromo ? 'Update Promo Code' : 'Create Promo Code'}
      />
    </>
  );
}
