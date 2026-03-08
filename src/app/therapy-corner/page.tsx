'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTherapists } from '@/app/queries/therapists/useTherapists';
import Sidebar from '@/components/Sidebar/LazySidebar';
import BookingModal from '@/components/Booking/BookingModal';
import Pagination from '@/components/common/Pagination';
import LottieLoader from '@/components/common/LottieLoader';
import { PAGE_SIZE_5 } from '@/lib/constants/pagination.constants';
import { Therapist } from '@/types/therapist.types';
import { trackViewTherapistProfile, trackStartBooking } from '@/utils/analytics';
import { ICON_FILTER } from '@/constants/icons';
import containerStyles from '@/app/dashboard/styles.module.css';
import styles from './styles.module.css';

import { FilterModal, FilterState } from './components/FilterModal';
import { TherapistCard } from './components/TherapistCard';
import { VideoPreviewModal } from './components/VideoPreviewModal';

const FILTER_ALL = '';
const FALLBACK_GENDERS = ['male', 'female', 'non_binary', 'other', 'prefer_not_to_say'] as const;

function formatExperience(experience?: string) {
  if (!experience) return 'Experience not specified';
  const normalized = experience.trim();
  if (/year/i.test(normalized)) return normalized;

  const numericMatch = normalized.match(/\d+/);
  if (numericMatch?.[0]) {
    return `${numericMatch[0]}+ years of experience`;
  }

  return normalized;
}

function formatGender(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function TherapyCornerPage() {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [page, setPage] = useState(1);

  const { data: therapists = [], isLoading: loading, error: fetchError } = useTherapists();
  const error = fetchError ? fetchError.message : '';

  const [filterState, setFilterState] = useState<FilterState>({
    language: FILTER_ALL,
    specialization: FILTER_ALL,
    gender: FILTER_ALL,
  });

  const [modalFilterState, setModalFilterState] = useState<FilterState>({
    language: FILTER_ALL,
    specialization: FILTER_ALL,
    gender: FILTER_ALL,
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [videoPreviewTherapist, setVideoPreviewTherapist] = useState<Therapist | null>(null);

  const limit = PAGE_SIZE_5;

  const filterOptions = useMemo(() => {
    const languages = new Set<string>();
    const specializations = new Set<string>();
    const genders = new Set<string>();
    therapists.forEach((therapist) => {
      therapist.languages?.forEach((language) => languages.add(language));
      therapist.specializations?.forEach((specialization) => specializations.add(specialization));
      if (therapist.gender) {
        genders.add(therapist.gender);
      }
    });
    return {
      languages: Array.from(languages).sort(),
      specializations: Array.from(specializations).sort(),
      genders: Array.from(genders).sort(),
    };
  }, [therapists]);

  const genderOptions = useMemo(() => {
    return filterOptions.genders.length > 0 ? filterOptions.genders : Array.from(FALLBACK_GENDERS);
  }, [filterOptions.genders]);

  const hasActiveFilters = Boolean(filterState.language || filterState.specialization || filterState.gender);

  const filteredTherapists = useMemo(() => {
    return therapists.filter((therapist) => {
      if (filterState.language && !therapist.languages?.includes(filterState.language)) return false;
      if (filterState.specialization && !therapist.specializations?.includes(filterState.specialization)) return false;
      if (filterState.gender && (therapist.gender || '').toLowerCase() !== filterState.gender.toLowerCase())
        return false;
      return true;
    });
  }, [therapists, filterState]);

  const total = filteredTherapists.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedTherapists = useMemo(
    () => filteredTherapists.slice((page - 1) * limit, page * limit),
    [filteredTherapists, page, limit],
  );

  const openFilterModal = () => {
    setModalFilterState(filterState);
    setIsFilterModalOpen(true);
  };

  const applyFilters = () => {
    setFilterState(modalFilterState);
    setPage(1);
    setIsFilterModalOpen(false);
  };

  const clearFilters = () => {
    setFilterState({ language: FILTER_ALL, specialization: FILTER_ALL, gender: FILTER_ALL });
    setModalFilterState({ language: FILTER_ALL, specialization: FILTER_ALL, gender: FILTER_ALL });
    setPage(1);
    setIsFilterModalOpen(false);
  };

  const handleBookAppointment = (therapist: Therapist) => {
    trackStartBooking({ therapist_id: therapist._id, therapist_name: therapist.name });
    setSelectedTherapist(therapist);
  };

  const handleViewProfile = (therapist: Therapist) => {
    trackViewTherapistProfile({ therapist_id: therapist._id, therapist_name: therapist.name });
  };

  return (
    <Sidebar className={styles.pageContentWhite}>
      <div className={containerStyles.container}>
        <section className={styles.section}>
          <div className={styles.highlightBanner}>
            <p>Finding the right therapist is not easy.</p>
            <span>Based on your needs, we curated a shortlist tailored for you.</span>
          </div>

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recommended Therapists</h2>
            <p className={styles.sectionMeta}>
              {filteredTherapists.length} therapist{filteredTherapists.length === 1 ? '' : 's'} available
            </p>
          </div>

          <div className={styles.toolbar}>
            <button type="button" className={styles.filterTrigger} onClick={openFilterModal}>
              <Icon icon={ICON_FILTER} width={18} height={18} />
              <span>Filters</span>
              {hasActiveFilters && <span className={styles.filterDot} aria-hidden="true" />}
            </button>
            {hasActiveFilters && (
              <button type="button" className={styles.clearFiltersBtn} onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          {loading && (
            <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
              <LottieLoader width={200} height={200} />
            </div>
          )}
          {error && <p className={styles.error}>{error}</p>}
          {!loading && !error && therapists.length === 0 && <p>No therapists found at the moment.</p>}

          {!loading && !error && therapists.length > 0 && (
            <>
              {filteredTherapists.length === 0 ? (
                <>
                  <p className={styles.noResults}>No therapists match the selected filters.</p>
                  <div className={styles.paginationWrap}>
                    <Pagination
                      page={1}
                      limit={limit}
                      total={0}
                      totalPages={1}
                      onPageChange={setPage}
                      ariaLabel="Recommended therapists pagination"
                    />
                  </div>
                </>
              ) : (
                <>
                  <ul className={styles.therapistList} aria-label="Recommended therapists">
                    {paginatedTherapists.map((therapist) => (
                      <TherapistCard
                        key={therapist._id}
                        therapist={therapist}
                        onViewProfile={handleViewProfile}
                        onBookAppointment={handleBookAppointment}
                        onVideoPreview={setVideoPreviewTherapist}
                        formatExperience={formatExperience}
                      />
                    ))}
                  </ul>
                  <div className={styles.paginationWrap}>
                    <Pagination
                      page={page}
                      limit={limit}
                      total={total}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      ariaLabel="Recommended therapists pagination"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        options={{
          languages: filterOptions.languages,
          specializations: filterOptions.specializations,
          genders: genderOptions,
        }}
        state={modalFilterState}
        onStateChange={(key, value) => setModalFilterState((prev) => ({ ...prev, [key]: value }))}
        onApply={applyFilters}
        onClear={clearFilters}
        formatGender={formatGender}
      />

      <VideoPreviewModal therapist={videoPreviewTherapist} onClose={() => setVideoPreviewTherapist(null)} />

      {selectedTherapist && (
        <BookingModal
          therapistId={selectedTherapist._id}
          therapistName={selectedTherapist.name}
          onClose={() => setSelectedTherapist(null)}
          onSuccess={() => {}}
        />
      )}
    </Sidebar>
  );
}
