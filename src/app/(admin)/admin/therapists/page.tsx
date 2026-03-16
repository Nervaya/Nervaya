'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LottieLoader, Pagination } from '@/components/common';
import { Icon } from '@iconify/react';
import { ICON_CALENDAR, ICON_USERS_GROUP, ICON_GLOBE, ICON_VIDEO } from '@/constants/icons';
import PageHeader from '@/components/PageHeader/PageHeader';
import StatusState from '@/components/common/StatusState';
import { therapistsApi } from '@/lib/api/therapists';
import { Therapist } from '@/types/therapist.types';
import { PAGE_SIZE_10 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';
import type { BreadcrumbItem } from '@/components/common/Breadcrumbs';
import { ConfirmDeleteDialog } from '@/components/Admin/common';
import { toast } from 'sonner';

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [_deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Therapists' }];

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
    try {
      setIsDeleting(true);
      const result = await therapistsApi.delete(id);
      if (result.success) {
        setConfirmDelete(null);
        toast.success(`Therapist "${confirmDelete.name}" deleted successfully`);
        fetchTherapists();
      } else {
        toast.error('Failed to delete therapist');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete therapist');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <ConfirmDeleteDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={confirmDelete?.name || ''}
        isDeleting={isDeleting}
      />

      <PageHeader
        title="Therapists"
        subtitle="Manage therapist profiles and information"
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/admin/therapists/add" className={styles.addButton}>
            Add New Therapist
          </Link>
        }
      />

      {loading ? (
        <div className={styles.loaderWrapper}>
          <LottieLoader width={200} height={200} centerPage />
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
        <>
          <StatusState type="empty" message="No therapists found. Click above to add the first one." />
          <div className={styles.paginationWrap}>
            <Pagination
              page={1}
              limit={limit}
              total={0}
              totalPages={1}
              onPageChange={setPage}
              ariaLabel="Therapists pagination"
            />
          </div>
        </>
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
                        <Icon icon={ICON_CALENDAR} />
                        <strong>Exp:</strong> {therapist.experience}
                      </span>
                      <span className={styles.infoItem}>
                        <Icon icon={ICON_USERS_GROUP} />
                        <strong>Gender:</strong> {therapist.gender || 'N/A'}
                      </span>
                      <span className={styles.infoItem}>
                        <Icon icon={ICON_GLOBE} />
                        <strong>Lang:</strong> {therapist.languages?.join(', ')}
                      </span>
                      <span className={styles.infoItem}>
                        <Icon icon={ICON_VIDEO} />
                        <strong>Video:</strong> {therapist.introVideoUrl ? 'Yes' : 'No'}
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
        </>
      )}
    </div>
  );
}
