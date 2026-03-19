'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Supplement, SupplementFormData } from '@/types/supplement.types';
import SupplementForm from '@/components/Admin/SupplementForm';
import { type BreadcrumbItem, StatusState } from '@/components/common';
import { useLoading } from '@/context/LoadingContext';
import PageHeader from '@/components/PageHeader/PageHeader';
import api from '@/lib/axios';
import styles from './styles.module.css';

export default function EditSupplementPage() {
  const params = useParams();
  const router = useRouter();
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    if (loading) {
      showLoader('Loading supplement details...');
    } else {
      hideLoader();
    }
  }, [loading, showLoader, hideLoader]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin', href: '/admin/dashboard' },
    { label: 'Supplements', href: '/admin/supplements' },
    { label: 'Edit' },
  ];

  const handleSubmit = async (data: SupplementFormData) => {
    try {
      setError(null);
      const response = (await api.put(`/supplements/${params.id}`, data)) as {
        success: boolean;
      };
      if (response.success) {
        router.push('/admin/supplements');
      } else {
        setError('Failed to update supplement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update supplement');
      throw err;
    }
  };

  useEffect(() => {
    const fetchSupplement = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await api.get(`/supplements/${params.id}`)) as {
          success: boolean;
          data: Supplement;
        };
        if (response.success && response.data) {
          setSupplement(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load supplement');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSupplement();
    }
  }, [params.id]);

  if (loading) {
    return null;
  }

  if (error || !supplement) {
    return (
      <div className={styles.container}>
        <PageHeader title="Edit Supplement" subtitle="Update supplement information" breadcrumbs={breadcrumbs} />
        <StatusState
          type="error"
          title={error ? 'Error' : 'Not Found'}
          message={error || 'Supplement not found'}
          action={
            <button onClick={() => router.push('/admin/supplements')} className={styles.backButton}>
              Back to Supplements
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader title="Edit Supplement" subtitle="Update supplement information" breadcrumbs={breadcrumbs} />
      {error && <div className={styles.error}>{error}</div>}
      <SupplementForm
        key={supplement._id}
        onSubmit={handleSubmit}
        initialData={supplement}
        submitLabel="Update Supplement"
      />
    </div>
  );
}
