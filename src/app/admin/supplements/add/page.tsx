'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SupplementFormData } from '@/types/supplement.types';
import SupplementForm from '@/components/Admin/SupplementForm';
import PageHeader from '@/components/PageHeader/PageHeader';
import api from '@/lib/axios';
import styles from './styles.module.css';

export default function AddSupplementPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: SupplementFormData) => {
    try {
      setError(null);
      const response = (await api.post('/supplements', data)) as {
        success: boolean;
      };
      if (response.success) {
        router.push('/admin/supplements');
      } else {
        setError('Failed to create supplement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create supplement');
      throw err;
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Add New Supplement" subtitle="Create a new supplement entry" />
      {error && <div className={styles.error}>{error}</div>}
      <SupplementForm key="create" onSubmit={handleSubmit} submitLabel="Create Supplement" />
    </div>
  );
}
