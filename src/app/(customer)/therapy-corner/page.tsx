'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTherapists } from '@/queries/therapists/useTherapists';
import Sidebar from '@/components/Sidebar/LazySidebar';
import BookingModal from '@/components/Booking/BookingModal';
import { Pagination, LottieLoader } from '@/components/common';
import { PAGE_SIZE_5 } from '@/lib/constants/pagination.constants';
import { scheduleApi } from '@/lib/api/schedule';
import { Therapist } from '@/types/therapist.types';
import { trackViewTherapistProfile, trackStartBooking } from '@/utils/analytics';
import { ICON_FILTER } from '@/constants/icons';
import styles from './styles.module.css';

import { FilterModal, FilterState } from './components/FilterModal';
import { TherapistCard } from './components/TherapistCard';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import PageHeader from '@/components/PageHeader/PageHeader';
import { BreadcrumbItem } from '@/components/common/Breadcrumbs';
import { CustomDropdown } from '@/components/common/CustomDropdown';
import {
  getDateKey,
  getNextAvailableSlotDateTime,
  formatNextSlot,
  formatExperienceYears,
  formatGender,
} from '@/utils/therapyUtils';

const FILTER_ALL = '';
const FALLBACK_GENDERS = ['male', 'female', 'non_binary', 'other', 'prefer_not_to_say'] as const;
const LOOKAHEAD_DAYS = 30;

export default function TherapyCornerPage() {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [page, setPage] = useState(1);
  const [nextSlotByTherapist, setNextSlotByTherapist] = useState<Record<string, string | null>>({});

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
    return therapists
      .filter((therapist) => {
        if (filterState.language && !therapist.languages?.includes(filterState.language)) return false;
        if (filterState.specialization && !therapist.specializations?.includes(filterState.specialization))
          return false;
        if (filterState.gender && (therapist.gender || '').toLowerCase() !== filterState.gender.toLowerCase())
          return false;
        return true;
      })
      .sort((a, b) => {
        if (a.isAvailable === b.isAvailable) return 0;
        return a.isAvailable ? -1 : 1;
      });
  }, [therapists, filterState]);

  const activeCount = useMemo(() => {
    return therapists.filter((t) => t.isAvailable).length;
  }, [therapists]);

  const total = filteredTherapists.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedTherapists = useMemo(
    () => filteredTherapists.slice((page - 1) * limit, page * limit),
    [filteredTherapists, page, limit],
  );

  useEffect(() => {
    if (paginatedTherapists.length === 0) {
      return;
    }

    let active = true;

    const loadNextSlots = async () => {
      const now = new Date();
      const startDate = getDateKey(now);
      const endDate = getDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + LOOKAHEAD_DAYS));

      const results = await Promise.all(
        paginatedTherapists.map(async (therapist) => {
          try {
            const response = await scheduleApi.getByDateRange(therapist._id, startDate, endDate, false);
            const schedules = Array.isArray(response.data) ? response.data : [];
            const nextSlotDateTime = getNextAvailableSlotDateTime(schedules, now);
            return [therapist._id, nextSlotDateTime ? formatNextSlot(nextSlotDateTime) : null] as const;
          } catch {
            return [therapist._id, null] as const;
          }
        }),
      );

      if (!active) return;

      setNextSlotByTherapist((prev) => ({
        ...prev,
        ...Object.fromEntries(results),
      }));
    };

    void loadNextSlots();

    return () => {
      active = false;
    };
  }, [paginatedTherapists]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

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

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }, { label: 'Therapy Corner' }];

  return (
    <Sidebar className={styles.pageContentWhite} hideGlobalBreadcrumbs>
      <div className={styles.container}>
        <section className={styles.section}>
          <PageHeader
            title="Finding the right therapist is not easy."
            subtitle="Based on your needs, we curated a shortlist tailored for you."
            breadcrumbs={breadcrumbs}
            actions={<p className={styles.sectionMeta}>{activeCount} Verified Experts Available</p>}
          />

          <div className={styles.toolbar}>
            <button type="button" className={styles.mobileFilterTrigger} onClick={openFilterModal}>
              <Icon icon={ICON_FILTER} width={18} height={18} />
              <span>Filters</span>
              {hasActiveFilters && <span className={styles.filterDot} aria-hidden="true" />}
            </button>

            <div className={styles.inlineFilters}>
              <CustomDropdown
                placeholder="Qualification"
                value={filterState.specialization}
                onChange={(val) => handleFilterChange('specialization', val)}
                options={[
                  { value: FILTER_ALL, label: 'Qualification' },
                  ...filterOptions.specializations.map((spec) => ({ value: spec, label: spec })),
                ]}
                icon="lucide:brain"
              />

              <CustomDropdown
                placeholder="Languages"
                value={filterState.language}
                onChange={(val) => handleFilterChange('language', val)}
                options={[
                  { value: FILTER_ALL, label: 'Languages' },
                  ...filterOptions.languages.map((lang) => ({ value: lang, label: lang })),
                ]}
                icon="lucide:languages"
              />

              <CustomDropdown
                placeholder="Gender"
                value={filterState.gender}
                onChange={(val) => handleFilterChange('gender', val)}
                options={[
                  { value: FILTER_ALL, label: 'Gender' },
                  ...genderOptions.map((gender) => ({ value: gender, label: formatGender(gender) })),
                ]}
                icon="lucide:user"
              />
            </div>

            {hasActiveFilters && (
              <button type="button" className={styles.clearFiltersBtn} onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          {loading && (
            <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
              <LottieLoader width={200} height={200} centerPage />
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
                        formatExperienceYears={formatExperienceYears}
                        nextSlotLabel={nextSlotByTherapist[therapist._id]}
                        isNextSlotLoading={!(therapist._id in nextSlotByTherapist)}
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
