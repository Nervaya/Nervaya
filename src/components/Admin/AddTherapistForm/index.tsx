'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import PageHeader from '@/components/PageHeader/PageHeader';
import { ICON_CHEVRON_LEFT, ICON_USER_PLUS } from '@/constants/icons';
import { ADD_THERAPIST_BREADCRUMBS } from './formData';
import { useAddTherapistForm } from './useAddTherapistForm';
import { BasicInformationSection } from './sections/BasicInformationSection';
import { PricingMediaSection } from './sections/PricingMediaSection';
import { ProfessionalDetailsSection } from './sections/ProfessionalDetailsSection';
import { ProfileContentSection } from './sections/ProfileContentSection';
import { ProfileImageSidebar } from './sections/ProfileImageSidebar';
import styles from './styles.module.css';

export default function AddTherapistForm() {
  const {
    error,
    formData,
    handleChange,
    handleImageUpload,
    handleSubmit,
    handleVideoUpload,
    loading,
    videoInputRef,
    videoUploading,
  } = useAddTherapistForm();

  return (
    <div className={styles.container}>
      <PageHeader
        title="Add New Therapist"
        subtitle="Create therapist profile with media and detailed profile information"
        breadcrumbs={ADD_THERAPIST_BREADCRUMBS}
        actions={
          <Link href="/admin/therapists" className={styles.backLink}>
            <Icon icon={ICON_CHEVRON_LEFT} aria-hidden />
            <span>Back to Therapists</span>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formLayout}>
          <div className={styles.formMain}>
            <BasicInformationSection formData={formData} onChange={handleChange} />
            <ProfessionalDetailsSection formData={formData} onChange={handleChange} />
            <ProfileContentSection formData={formData} onChange={handleChange} />
            <PricingMediaSection
              formData={formData}
              onChange={handleChange}
              onVideoUpload={handleVideoUpload}
              videoInputRef={videoInputRef}
              videoUploading={videoUploading}
            />
          </div>

          <ProfileImageSidebar imageUrl={formData.image} onImageUpload={handleImageUpload} />
        </div>

        <div className={styles.formActions}>
          <Link href="/admin/therapists" className={styles.cancelButton}>
            Cancel
          </Link>
          <button type="submit" disabled={loading || videoUploading} className={styles.submitButton}>
            {loading ? (
              <span className={styles.buttonContent}>
                <span className={styles.spinner} />
                <span>Creating...</span>
              </span>
            ) : (
              <span className={styles.buttonContent}>
                <Icon icon={ICON_USER_PLUS} />
                <span>Create Therapist</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
