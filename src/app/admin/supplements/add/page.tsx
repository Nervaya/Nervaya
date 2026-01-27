'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SupplementFormData } from '@/types/supplement.types';
import SupplementForm from '@/components/Admin/SupplementForm';
import api from '@/lib/axios';
import styles from './styles.module.css';

export default function AddSupplementPage() {
  const router = useRouter();

  const handleSubmit = async (data: SupplementFormData) => {
    try {
      const response = (await api.post('/supplements', data)) as {
        success: boolean;
      };
      if (response.success) {
        router.push('/admin/supplements');
      } else {
        alert('Failed to create supplement');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create supplement');
      throw err;
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add New Supplement</h2>
      <SupplementForm onSubmit={handleSubmit} submitLabel="Create Supplement" />
    </div>
  );
}
