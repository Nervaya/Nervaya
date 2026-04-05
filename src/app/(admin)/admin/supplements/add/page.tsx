'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { ICON_ARROW_LEFT } from '@/constants/icons';
import { SupplementFormData } from '@/types/supplement.types';
import SupplementForm from '@/components/Admin/SupplementForm';
import PageHeader from '@/components/PageHeader/PageHeader';
import { type BreadcrumbItem } from '@/components/common';
import api from '@/lib/axios';
import { toast } from 'sonner';
import styles from './styles.module.css';

export default function AddSupplementPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: SupplementFormData) => {
    try {
      setError(null);
      const response = (await api.post('/supplements', data)) as { success: boolean };
      if (response.success) {
        toast.success('Supplement created successfully');
        router.push('/admin/supplements');
      } else {
        setError('Failed to create supplement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create supplement');
      throw err;
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin', href: '/admin/dashboard' },
    { label: 'Supplements', href: '/admin/supplements' },
    { label: 'Add New' },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="Add New Supplement"
        subtitle="Create a new supplement entry for your store"
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/admin/supplements" className={styles.backLink}>
            <Icon icon={ICON_ARROW_LEFT} aria-hidden />
            Back to Supplements
          </Link>
        }
      />
      {error && <div className={styles.error}>{error}</div>}
      <SupplementForm key="create" onSubmit={handleSubmit} submitLabel="Create Supplement" />
    </div>
  );
}
