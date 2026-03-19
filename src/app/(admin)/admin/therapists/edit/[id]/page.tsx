'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { therapistsApi } from '@/lib/api/therapists';
import { type BreadcrumbItem } from '@/components/common';
import { useLoading } from '@/context/LoadingContext';
import AddTherapistForm from '@/components/Admin/AddTherapistForm';
import type { Therapist } from '@/types/therapist.types';

export default function EditTherapistPage() {
  const router = useRouter();
  const params = useParams();
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Therapist | null>(null);
  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    if (initialLoading) {
      showLoader('Loading therapist details...');
    } else {
      hideLoader();
    }
  }, [initialLoading, showLoader, hideLoader]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin', href: '/admin/dashboard' },
    { label: 'Therapists', href: '/admin/therapists' },
    { label: 'Edit' },
  ];

  useEffect(() => {
    const fetchTherapist = async () => {
      if (!params.id) {
        setError('Therapist ID is required');
        setInitialLoading(false);
        return;
      }

      try {
        const result = await therapistsApi.getById(params.id as string);
        if (result.success && result.data) {
          setInitialData(result.data);
        } else {
          setError(result.message || 'Failed to fetch therapist details');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error fetching therapist details';
        setError(errorMessage);
        console.error('Therapist fetch error:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchTherapist();
  }, [params.id]);

  if (error || !initialData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error || 'Therapist not found'}</p>
        <button
          onClick={() => router.push('/admin/therapists')}
          style={{ padding: '8px 16px', borderRadius: '8px', background: '#7c3aed', color: 'white', border: 'none' }}
        >
          Back to Therapists
        </button>
      </div>
    );
  }

  return (
    <AddTherapistForm
      therapistId={params.id as string}
      initialData={initialData}
      title="Edit Therapist"
      subtitle="Update therapist profile information"
      submitLabel="Update Therapist"
      breadcrumbs={breadcrumbs}
    />
  );
}
