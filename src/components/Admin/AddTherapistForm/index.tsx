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
import { type BreadcrumbItem } from '@/components/common';
import styles from './styles.module.css';

const STEPS = [
  { id: 1, label: 'Basic Info', icon: 'lucide:user' },
  { id: 2, label: 'Professional', icon: 'lucide:briefcase' },
  { id: 3, label: 'Content', icon: 'lucide:file-text' },
  { id: 4, label: 'Pricing & Photo', icon: 'lucide:camera' },
];
interface AddTherapistFormProps {
  initialData?: import('@/types/therapist.types').Therapist | null;
  therapistId?: string;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AddTherapistForm({
  initialData,
  therapistId,
  title = 'Add New Therapist',
  subtitle = 'Create therapist profile with media and detailed profile information',
  submitLabel = 'Create Therapist',
  breadcrumbs = ADD_THERAPIST_BREADCRUMBS,
}: AddTherapistFormProps) {
  const {
    error,
    formData,
    handleChange,
    handleImageUpload,
    handleTagChange,
    handleSubmit,
    handleVideoUpload,
    loading,
    videoInputRef,
    videoUploading,
    imageUploading,
    handleImageLoading,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    totalSteps,
  } = useAddTherapistForm(initialData, therapistId);

  const icon = therapistId ? 'lucide:pencil' : ICON_USER_PLUS;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInformationSection formData={formData} onChange={handleChange} />;
      case 2:
        return <ProfessionalDetailsSection formData={formData} onChange={handleChange} onTagChange={handleTagChange} />;
      case 3:
        return <ProfileContentSection formData={formData} onChange={handleChange} />;
      case 4:
        return (
          <div className={styles.formLayout}>
            <div className={styles.formMain}>
              <PricingMediaSection
                formData={formData}
                onChange={handleChange}
                onVideoUpload={handleVideoUpload}
                videoInputRef={videoInputRef}
                videoUploading={videoUploading}
              />
            </div>
            <ProfileImageSidebar
              imageUrl={formData.image}
              onImageUpload={handleImageUpload}
              onLoadingChange={handleImageLoading}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/admin/therapists" className={styles.backLink}>
            <Icon icon={ICON_CHEVRON_LEFT} aria-hidden />
            <span>Back to Therapists</span>
          </Link>
        }
      />

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          const target = e.target as HTMLElement;

          // Allow Enter in textareas for new lines
          if (target.tagName === 'TEXTAREA') return;

          // Only allow Enter if the focus is on a submit button
          const isSubmitButton = target.tagName === 'BUTTON' && (target as HTMLButtonElement).type === 'submit';
          if (!isSubmitButton) {
            e.preventDefault();
          }
        }}
        className={styles.form}
      >
        <div className={styles.formHeader}>
          <div className={styles.stepper}>
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`${styles.step} ${currentStep === step.id ? styles.active : ''} ${
                  currentStep > step.id ? styles.completed : ''
                }`}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              >
                <div className={styles.stepCircle}>
                  {currentStep > step.id ? <Icon icon="lucide:check" /> : <Icon icon={step.icon} />}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formBody}>
          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          <div className={styles.formSectionWrapper}>{renderCurrentStep()}</div>
        </div>

        <div className={styles.formActions}>
          <div className={styles.actionLeft}>
            {currentStep > 1 && (
              <button key="prev-button" type="button" onClick={prevStep} className={styles.navButton}>
                <Icon icon="lucide:arrow-left" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className={styles.actionRight}>
            <Link href="/admin/therapists" className={styles.navButton}>
              Cancel
            </Link>

            {currentStep < totalSteps ? (
              <button
                key="continue-button"
                type="button"
                onClick={nextStep}
                className={`${styles.navButton} ${styles.primaryButton}`}
              >
                <span>Continue</span>
                <Icon icon="lucide:arrow-right" />
              </button>
            ) : (
              <button
                key="submit-button"
                type="submit"
                disabled={loading || videoUploading || imageUploading}
                className={`${styles.navButton} ${styles.primaryButton}`}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} />
                    <span>{therapistId ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Icon icon={icon} />
                    <span>{submitLabel}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
