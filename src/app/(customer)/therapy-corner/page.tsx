'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTherapists } from '@/queries/therapists/useTherapists';
import Sidebar from '@/components/Sidebar/LazySidebar';
import BookingModal from '@/components/Booking/BookingModal';
import Pagination from '@/components/common/Pagination';
import StatusState from '@/components/common/StatusState';
import LottieLoader from '@/components/common/LottieLoader';
import { PAGE_SIZE_5 } from '@/lib/constants/pagination.constants';
import { scheduleApi, ScheduleByDateRangeItem } from '@/lib/api/schedule';
import { Therapist } from '@/types/therapist.types';
import { trackViewTherapistProfile, trackStartBooking } from '@/utils/analytics';
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
import { BreadcrumbItem } from '@/components/common/Breadcrumbs';
import { CustomDropdown } from '@/components/common/CustomDropdown';
import { FilterModal } from './components/FilterModal';
import MultiSelect from '@/components/common/MultiSelect/MultiSelect';
import { ICON_FILTER } from '@/constants/icons';

const FILTER_ALL = '';
const FALLBACK_GENDERS = ['male', 'female', 'non_binary', 'other', 'prefer_not_to_say'] as const;
const LOOKAHEAD_DAYS = 30;

function parseTime12Hour(timeValue: string): { hours: number; minutes: number } | null {
  const match = timeValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const hour = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (Number.isNaN(hour) || Number.isNaN(minutes) || hour > 12 || minutes > 59) {
    return null;
  }

  let hours24 = hour % 12;
  if (period === 'PM') {
    hours24 += 12;
  }

  return { hours: hours24, minutes };
}

function getSlotDateTime(dateValue: string, startTime: string): Date | null {
  const [year, month, day] = dateValue.split('-').map(Number);
  const parsedTime = parseTime12Hour(startTime);

  if (!year || !month || !day || !parsedTime) {
    return null;
  }

  const dateTime = new Date(year, month - 1, day, parsedTime.hours, parsedTime.minutes, 0, 0);
  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
}

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNextAvailableSlotDateTime(schedules: ScheduleByDateRangeItem[], now: Date): Date | null {
  const slots = schedules
    .flatMap((schedule) =>
      schedule.slots.map((slot) => ({
        dateTime: getSlotDateTime(schedule.date, slot.startTime),
        isAvailable: slot.isAvailable,
      })),
    )
    .filter(
      (slot): slot is { dateTime: Date; isAvailable: boolean } =>
        slot.isAvailable && slot.dateTime !== null && slot.dateTime.getTime() > now.getTime(),
    )
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  return slots[0]?.dateTime ?? null;
}

function formatNextSlot(dateTime: Date): string {
  const datePart = dateTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
  const timePart = dateTime.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart} ${timePart}`;
}

function formatExperienceYears(experience?: string): string {
  if (!experience || !experience.trim()) return '—';
  const normalized = experience.trim();
  const numericMatch = normalized.match(/\d+/);
  if (numericMatch?.[0]) {
    return `${numericMatch[0]}+ years`;
  }
  if (/year/i.test(normalized)) return normalized;
  return normalized;
}

function formatGender(value: string) {
  if (!value) return '';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function TherapyCornerPage() {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [page, setPage] = useState(1);
  const [nextSlotByTherapist, setNextSlotByTherapist] = useState<Record<string, string | null>>({});

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

  const genderOptions = useMemo(() => {
    return filterOptions.genders.length > 0 ? filterOptions.genders : Array.from(FALLBACK_GENDERS);
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
                icon="lucide:languages"
              />

              <CustomDropdown
                placeholder="Gender"
                value={filterState.gender}
                onChange={(val) => handleFilterChange('gender', val)}
                options={genderOptions.map((gender) => ({ value: gender, label: formatGender(gender) }))}
                icon="lucide:user"
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
