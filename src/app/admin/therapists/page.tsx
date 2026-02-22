'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LottieLoader from '@/components/common/LottieLoader';
import PageHeader from '@/components/PageHeader/PageHeader';
import Pagination from '@/components/common/Pagination';
import StatusState from '@/components/common/StatusState';
import { therapistsApi } from '@/lib/api/therapists';
import { Therapist } from '@/types/therapist.types';
import { PAGE_SIZE_10 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);

  const limit = PAGE_SIZE_10;
  const total = therapists.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedTherapists = useMemo(
    () => therapists.slice((page - 1) * limit, page * limit),
    [therapists, page, limit],
  );

  const fetchTherapists = async () => {
    try {
      setError(false);
      const result = await therapistsApi.getAll();
      if (result.success && result.data) {
        setTherapists(result.data);
      } else {
        setError(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to fetch therapists', error);
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const handleDeleteClick = (id: string, name: string) => {
    setConfirmDelete({ id, name });
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setConfirmDelete(null);
    try {
      const result = await therapistsApi.delete(id);
      if (result.success) {
        fetchTherapists();
      } else {
        setDeleteError('Failed to delete therapist');
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete therapist');
    }
  };

  return (
    <div>
      {confirmDelete && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {confirmDelete.name}? This action cannot be undone.</p>
            {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            <div className={styles.confirmActions}>
              <button onClick={handleDeleteConfirm} className={styles.confirmButton}>
                Delete
              </button>
              <button onClick={() => setConfirmDelete(null)} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title="Therapists"
        subtitle="Manage therapist profiles and information"
        actions={
          <Link href="/admin/therapists/add" className={styles.addButton}>
            Add New Therapist
          </Link>
        }
      />

      {loading ? (
        <div className={styles.loaderWrapper}>
          <LottieLoader width={200} height={200} />
        </div>
      ) : error ? (
        <StatusState
          type="error"
          message="Failed to load therapists data. Please check your connection or try again later."
          action={
            <button onClick={fetchTherapists} className={styles.addButton}>
              Retry
            </button>
          }
        />
      ) : therapists.length === 0 ? (
        <StatusState type="empty" message="No therapists found. Click above to add the first one." />
      ) : (
        <>
          <ul className={styles.list} aria-label="Therapist list">
            {paginatedTherapists.map((therapist) => (
              <li key={therapist._id} className={styles.card}>
                <div className={styles.therapistInfo}>
                  <Image
                    src={therapist.image || '/default-therapist.png'}
                    alt={therapist.name}
                    width={100}
                    height={100}
                    className={styles.therapistImage}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&background=random`;
                    }}
                  />
                  <div className={styles.details}>
                    <h3>{therapist.name}</h3>
                    <p className={styles.qualifications}>{therapist.qualifications?.join(', ')}</p>

                    <div className={styles.infoRow}>
                      <span className={styles.infoItem}>
                        <strong>Exp:</strong> {therapist.experience}
                      </span>
                      <span className={styles.infoItem}>
                        <strong>Lang:</strong> {therapist.languages?.join(', ')}
                      </span>
                    </div>

                    <div className={styles.chips}>
                      {therapist.specializations?.map((spec: string) => (
                        <span key={spec} className={styles.chip}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Link href={`/admin/therapists/${therapist._id}/slots`} className={styles.slotsButton}>
                    Manage Slots
                  </Link>
                  <Link href={`/admin/therapists/edit/${therapist._id}`} className={styles.editButton}>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(therapist._id, therapist.name)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {total > 0 && (
            <div className={styles.paginationWrap}>
              <Pagination
                page={page}
                limit={limit}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                ariaLabel="Therapists pagination"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
