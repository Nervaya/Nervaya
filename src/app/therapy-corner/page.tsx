'use client';

import { useEffect, useMemo, useState } from 'react';
import { therapistsApi } from '@/lib/api/therapists';
import Sidebar from '@/components/Sidebar/LazySidebar';
import BookingModal from '@/components/Booking/BookingModal';
import Pagination from '@/components/common/Pagination';
import LottieLoader from '@/components/common/LottieLoader';
import { PAGE_SIZE_5 } from '@/lib/constants/pagination.constants';
import { Therapist } from '@/types/therapist.types';
import { trackViewTherapistProfile, trackStartBooking } from '@/utils/analytics';
import containerStyles from '@/app/dashboard/styles.module.css';
import styles from './styles.module.css';

const FILTER_ALL = '';

export default function TherapyCornerPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [page, setPage] = useState(1);
  const [filterLanguage, setFilterLanguage] = useState(FILTER_ALL);
  const [filterSpecialization, setFilterSpecialization] = useState(FILTER_ALL);
  const [filterExperience, setFilterExperience] = useState(FILTER_ALL);

  const limit = PAGE_SIZE_5;

  const filterOptions = useMemo(() => {
    const languages = new Set<string>();
    const specializations = new Set<string>();
    const experiences = new Set<string>();
    therapists.forEach((t) => {
      t.languages?.forEach((l) => languages.add(l));
      t.specializations?.forEach((s) => specializations.add(s));
      if (t.experience) experiences.add(t.experience);
    });
    return {
      languages: Array.from(languages).sort(),
      specializations: Array.from(specializations).sort(),
      experiences: Array.from(experiences).sort(),
    };
  }, [therapists]);

  const filteredTherapists = useMemo(() => {
    return therapists.filter((t) => {
      if (filterLanguage && !t.languages?.includes(filterLanguage)) return false;
      if (filterSpecialization && !t.specializations?.includes(filterSpecialization)) return false;
      if (filterExperience && t.experience !== filterExperience) return false;
      return true;
    });
  }, [therapists, filterLanguage, filterSpecialization, filterExperience]);

  const total = filteredTherapists.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedTherapists = useMemo(
    () => filteredTherapists.slice((page - 1) * limit, page * limit),
    [filteredTherapists, page, limit],
  );

  useEffect(() => {
    fetchTherapists();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterLanguage, filterSpecialization, filterExperience]);

  const fetchTherapists = async () => {
    try {
      const result = await therapistsApi.getAll();
      setTherapists(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (therapist: Therapist) => {
    trackStartBooking({ therapist_id: therapist._id, therapist_name: therapist.name });
    setSelectedTherapist(therapist);
  };

  const handleViewProfile = (therapist: Therapist) => {
    trackViewTherapistProfile({ therapist_id: therapist._id, therapist_name: therapist.name });
  };

  const getInitials = (name: string) => {
    const [first = '', second = ''] = name.trim().split(/\s+/, 2);
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || 'T';
  };

  return (
    <Sidebar className={styles.pageContentWhite}>
      <div className={containerStyles.container}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recommended Therapists</h2>
            <p className={styles.sectionMeta}>
              {filteredTherapists.length} therapist{filteredTherapists.length === 1 ? '' : 's'} available
            </p>
          </div>

          {loading && (
            <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
              <LottieLoader width={200} height={200} />
            </div>
          )}
          {error && <p className={styles.error}>{error}</p>}

          {!loading && !error && therapists.length === 0 && (
            <>
              <p>No therapists found at the moment.</p>
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
          )}

          {!loading && !error && therapists.length > 0 && (
            <>
              <div className={styles.filterBar} aria-label="Filter therapists">
                <label className={styles.filterField}>
                  <span>Language</span>
                  <select
                    className={styles.filterSelect}
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    aria-label="Filter by language"
                  >
                    <option value={FILTER_ALL}>All Languages</option>
                    {filterOptions.languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.filterField}>
                  <span>Specialization</span>
                  <select
                    className={styles.filterSelect}
                    value={filterSpecialization}
                    onChange={(e) => setFilterSpecialization(e.target.value)}
                    aria-label="Filter by specialization"
                  >
                    <option value={FILTER_ALL}>All Specializations</option>
                    {filterOptions.specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.filterField}>
                  <span>Experience</span>
                  <select
                    className={styles.filterSelect}
                    value={filterExperience}
                    onChange={(e) => setFilterExperience(e.target.value)}
                    aria-label="Filter by experience"
                  >
                    <option value={FILTER_ALL}>Any Experience</option>
                    {filterOptions.experiences.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

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
                      <li
                        key={therapist._id}
                        className={styles.therapistCard}
                        onMouseEnter={() => handleViewProfile(therapist)}
                      >
                        <div className={styles.cardBody}>
                          <div className={styles.therapistInfo}>
                            {therapist.image ? (
                              <div
                                className={styles.avatar}
                                style={{ backgroundImage: `url(${therapist.image})` }}
                                role="img"
                                aria-label={`${therapist.name} profile picture`}
                              />
                            ) : (
                              <div className={styles.avatarFallback} aria-hidden="true">
                                {getInitials(therapist.name)}
                              </div>
                            )}
                            <div className={styles.therapistText}>
                              <div className={styles.nameRow}>
                                <h3>{therapist.name}</h3>
                                <span className={styles.expBadge}>{therapist.experience || 'Experience N/A'}</span>
                              </div>
                              <p className={styles.credentials}>
                                {therapist.qualifications?.join(', ') || 'Professional Therapist'}
                              </p>
                              <p className={styles.metaLine}>
                                <span>Speaks</span>
                                {therapist.languages?.join(', ') || 'N/A'}
                              </p>
                              <div className={styles.tags} aria-label={`${therapist.name} specializations`}>
                                {therapist.specializations?.length ? (
                                  therapist.specializations.map((spec) => (
                                    <span key={spec} className={styles.tag} title={spec}>
                                      {spec}
                                    </span>
                                  ))
                                ) : (
                                  <span className={styles.emptyTag}>General Therapy</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={styles.actions}>
                            <button className={styles.primaryBtn} onClick={() => handleBookAppointment(therapist)}>
                              Book Appointment
                            </button>
                          </div>
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
                      ariaLabel="Recommended therapists pagination"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>

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
