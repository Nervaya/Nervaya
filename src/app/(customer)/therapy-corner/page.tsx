'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTherapists } from '@/queries/therapists/useTherapists';
import Sidebar from '@/components/Sidebar/LazySidebar';
import BookingModal from '@/components/Booking/BookingModal';
import {
  Pagination,
  StatusState,
  GlobalLoader,
  type BreadcrumbItem,
  CustomDropdown,
  MultiSelect,
  Badge,
} from '@/components/common';
import { type Option } from '@/components/common/CustomDropdown';
import { PAGE_SIZE_5 } from '@/lib/constants/pagination.constants';
import { GENDER_OPTIONS } from '@/lib/constants/enums';
import { scheduleApi } from '@/lib/api/schedule';
import { Therapist } from '@/types/therapist.types';
import { trackViewTherapistProfile, trackStartBooking } from '@/utils/analytics';
import { getDateKey, getNextAvailableSlotDateTime, formatNextSlot, formatExperienceYears } from '@/utils/therapyUtils';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/routesConstants';
import styles from './styles.module.css';

export interface FilterState {
  language: string;
  specialization: string[];
  gender: string;
  minExperience: string;
}
import { TherapistCard } from './components/TherapistCard';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import PageHeader from '@/components/PageHeader/PageHeader';
import { FilterModal } from './components/FilterModal';
import { ICON_FILTER, ICON_LANGUAGES, ICON_USER_LUCIDE } from '@/constants/icons';

const FILTER_ALL = '';
const LOOKAHEAD_DAYS = 30;

export default function TherapyCornerPage() {
  const [filterState, setFilterState] = useState<FilterState>({
    language: FILTER_ALL,
    specialization: [],
    gender: FILTER_ALL,
    minExperience: FILTER_ALL,
  });

  const apiParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (filterState.language) params.language = filterState.language;
    if (filterState.specialization.length > 0) params.specializations = filterState.specialization.join(',');
    if (filterState.gender) params.gender = filterState.gender;
    if (filterState.minExperience) params.minExperience = filterState.minExperience;
    return params;
  }, [filterState]);

  const { data: therapists = [], isLoading: loading, error: fetchError } = useTherapists(apiParams);
  // Separate call to get all options regardless of active filters
  const { data: allTherapists = [] } = useTherapists();

  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [page, setPage] = useState(1);
  const [nextSlotByTherapist, setNextSlotByTherapist] = useState<Record<string, string | null>>({});

  const error = fetchError instanceof Error ? fetchError.message : '';

  const [modalFilterState, setModalFilterState] = useState<FilterState>({
    language: FILTER_ALL,
    specialization: [],
    gender: FILTER_ALL,
    minExperience: FILTER_ALL,
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [videoPreviewTherapist, setVideoPreviewTherapist] = useState<Therapist | null>(null);

  const limit = PAGE_SIZE_5;

  const filterOptions = useMemo(() => {
    const languages = new Set<string>();
    const specializations = new Set<string>();
    const genders = new Set<string>();
    allTherapists.forEach((therapist) => {
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
  }, [allTherapists]);

  const genderOptions = useMemo<Option[]>(() => {
    const availableGenders = new Set(filterOptions.genders);
    return GENDER_OPTIONS.filter((opt) => availableGenders.has(opt.value)).map((opt) => ({
      value: opt.value,
      label: opt.label,
    }));
  }, [filterOptions.genders]);

  const hasActiveFilters = Boolean(
    filterState.language || filterState.specialization.length > 0 || filterState.gender || filterState.minExperience,
  );

  const filteredTherapists = useMemo(() => {
    return therapists.sort((a, b) => {
      if (a.isAvailable === b.isAvailable) return 0;
      return a.isAvailable ? -1 : 1;
    });
  }, [therapists]);

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

  const handleFilterChange = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
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
    const initialState = {
      language: FILTER_ALL,
      specialization: [],
      gender: FILTER_ALL,
      minExperience: FILTER_ALL,
    };
    setFilterState(initialState);
    setModalFilterState(initialState);
    setPage(1);
    setIsFilterModalOpen(false);
  };

  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleBookAppointment = (therapist: Therapist) => {
    if (!isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }
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
            actions={
              <Badge variant="purple" size="sm" className={styles.sectionMeta}>
                {activeCount} Verified Experts Available
              </Badge>
            }
          />

          <div className={styles.toolbar}>
            <button type="button" className={styles.mobileFilterTrigger} onClick={openFilterModal}>
              <Icon icon={ICON_FILTER} width={18} height={18} />
              <span>Filters</span>
              {hasActiveFilters && <span className={styles.filterDot} aria-hidden="true" />}
            </button>

            <div className={styles.inlineFilters}>
              <MultiSelect
                placeholder="Qualification"
                values={filterState.specialization}
                onChange={(vals) => handleFilterChange('specialization', vals)}
                options={filterOptions.specializations.map((spec) => ({ value: spec, label: spec }))}
              />

              <CustomDropdown
                placeholder="Languages"
                value={filterState.language}
                onChange={(val) => handleFilterChange('language', val)}
                options={filterOptions.languages.map((lang) => ({ value: lang, label: lang }))}
                icon={ICON_LANGUAGES}
              />

              <CustomDropdown
                placeholder="Gender"
                value={filterState.gender}
                onChange={(val) => handleFilterChange('gender', val)}
                options={genderOptions}
                icon={ICON_USER_LUCIDE}
              />

              <input
                type="number"
                min="0"
                className={styles.toolbarNumericInput}
                placeholder="Experience"
                value={filterState.minExperience}
                onChange={(e) => handleFilterChange('minExperience', e.target.value)}
              />
            </div>

            {hasActiveFilters && (
              <button type="button" className={styles.clearFiltersBtn} onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {loading && (
            <div className={styles.loadingContainer}>
              <GlobalLoader label="Loading therapists..." />
            </div>
          )}
          {!loading && !error && (
            <>
              {therapists.length === 0 ? (
                <StatusState
                  type="empty"
                  title="No therapists found"
                  message="We couldn't find any therapists matching your filters. Try adjusting your criteria or clearing all filters."
                  action={
                    <button type="button" className={styles.clearFiltersBtn} onClick={clearFilters}>
                      Clear All Filters
                    </button>
                  }
                />
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
