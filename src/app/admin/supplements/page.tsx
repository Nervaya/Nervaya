'use client';

import React, { useState, useCallback } from 'react';
import { Supplement, SupplementFormData } from '@/types/supplement.types';
import type { SupplementFiltersParams } from '@/lib/api/supplements';
import SupplementList from '@/components/Admin/SupplementList';
import SupplementModal from '@/components/Admin/SupplementModal';
import SupplementFilters from '@/components/Admin/SupplementFilters';
import Pagination from '@/components/common/Pagination';
import { useAdminSupplements } from '@/app/queries/supplements/useSupplements';
import api from '@/lib/axios';
import { PAGE_SIZE_10 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';

function countActiveFilters(f: SupplementFiltersParams): number {
  let n = 0;
  if (f.isActive !== undefined) n++;
  if (f.search?.trim()) n++;
  if (f.minStock != null && !Number.isNaN(f.minStock)) n++;
  if (f.maxStock != null && !Number.isNaN(f.maxStock)) n++;
  return n;
}

export default function AdminSupplementsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SupplementFiltersParams>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = PAGE_SIZE_10;
  const { data: supplements, meta, isLoading, error: fetchError, refetch } = useAdminSupplements(page, limit, filters);

  const handleFiltersApply = useCallback((newFilters: SupplementFiltersParams) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = (await api.delete(`/supplements/${id}`)) as { success: boolean };
      if (response.success) {
        refetch();
      } else {
        setError('Failed to delete supplement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete supplement');
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
    setError(null);
    try {
      if (editingSupplement) {
        const response = (await api.put(`/supplements/${editingSupplement._id}`, data)) as { success: boolean };
        if (response.success) {
          refetch();
          handleModalClose();
        } else {
          setError('Failed to update supplement');
          throw new Error('Failed to update supplement');
        }
      } else {
        const response = (await api.post('/supplements', data)) as { success: boolean };
        if (response.success) {
          refetch();
          handleModalClose();
        } else {
          setError('Failed to create supplement');
          throw new Error('Failed to create supplement');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save supplement');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = error ?? fetchError ?? null;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Manage Supplements</h2>
          <button type="button" onClick={handleAdd} className={styles.addButton}>
            Add New Supplement
          </button>
        </div>
        {displayError && (
          <div className={styles.error} role="alert">
            {displayError}
          </div>
        )}
        <SupplementFilters
          initialFilters={filters}
          onApply={handleFiltersApply}
          onReset={handleFiltersReset}
          activeCount={countActiveFilters(filters)}
        />
        <SupplementList
          supplements={supplements ?? []}
          onDelete={handleDelete}
          onEdit={handleEdit}
          loading={isLoading}
        />
        {meta && meta.totalPages > 1 && (
          <div className={styles.paginationWrap}>
            <Pagination
              page={meta.page}
              limit={meta.limit}
              total={meta.total}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              ariaLabel="Supplements pagination"
            />
          </div>
        )}
      </div>

      <SupplementModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        initialData={editingSupplement ?? undefined}
        loading={submitting}
        title={editingSupplement ? 'Edit Supplement' : 'Add New Supplement'}
        submitLabel={editingSupplement ? 'Update Supplement' : 'Create Supplement'}
      />
    </>
  );
}
