'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { therapistsApi } from '@/lib/api/therapists';
import { uploadApi } from '@/lib/api/upload';
import styles from './styles.module.css';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import PageHeader from '@/components/PageHeader/PageHeader';
import { Icon } from '@iconify/react';
import {
  ICON_ARROW_LEFT,
  ICON_UPLOAD,
  ICON_USER_PLUS,
  ICON_INFO,
  ICON_RECEIPT,
  ICON_FILE,
  ICON_TAG,
  ICON_USER,
} from '@/constants/icons';
import { GENDER_OPTIONS, parseCommaSeparated, parseTestimonials } from '@/lib/utils/therapist.utils';
import type { BreadcrumbItem } from '@/components/common/Breadcrumbs';

export default function AddTherapistPage() {
  const router = useRouter();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin', href: '/admin/dashboard' },
    { label: 'Therapists', href: '/admin/therapists' },
    { label: 'Add New' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    qualifications: '',
    experience: '',
    gender: 'other',
    languages: '',
    specializations: '',
    image: '',
    introVideoUrl: '',
    introVideoThumbnail: '',
    galleryImages: '',
    bio: '',
    bioLong: '',
    quote: '',
    messageToClient: '',
    sessionFee: '',
    sessionDurationMins: '',
    sessionModes: '',
    testimonials: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setVideoUploading(true);
    setError(null);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      const response = await uploadApi.video(uploadForm);
      if (response.success && response.data?.url) {
        const videoUrl = response.data.url;
        setFormData((prev) => ({ ...prev, introVideoUrl: videoUrl }));
      } else {
        setError(response.message || 'Video upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video upload failed');
    } finally {
      setVideoUploading(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        gender: formData.gender as 'male' | 'female' | 'other',
        qualifications: parseCommaSeparated(formData.qualifications),
        languages: parseCommaSeparated(formData.languages),
        specializations: parseCommaSeparated(formData.specializations),
        galleryImages: parseCommaSeparated(formData.galleryImages),
        sessionModes: parseCommaSeparated(formData.sessionModes),
        testimonials: parseTestimonials(formData.testimonials),
        sessionFee: formData.sessionFee ? Number(formData.sessionFee) : 0,
        sessionDurationMins: formData.sessionDurationMins ? Number(formData.sessionDurationMins) : 0,
      };

      const result = await therapistsApi.create(payload);

      if (result.success) {
        router.push('/admin/therapists');
      } else {
        setError('Failed to create therapist');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Add New Therapist"
        subtitle="Create therapist profile with media and detailed profile information"
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/admin/therapists" className={styles.backLink}>
            <Icon icon={ICON_ARROW_LEFT} aria-hidden />
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
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Icon icon={ICON_INFO} />
                <span>Basic Information</span>
              </h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="name">
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="john.smith@example.com"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="experience">
                    Experience <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="10+ years"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="gender">
                    Gender <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Icon icon={ICON_RECEIPT} />
                <span>Professional Details</span>
              </h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="qualifications">
                    Qualifications <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="M.A. Psychology, Licensed Therapist"
                  />
                  <span className={styles.hint}>Comma separated</span>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="specializations">
                    Specializations <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="specializations"
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Anxiety, Depression, Sleep Disorders"
                  />
                  <span className={styles.hint}>Comma separated</span>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="languages">
                    Languages <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="languages"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="English, Hindi"
                  />
                  <span className={styles.hint}>Comma separated</span>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="sessionModes">
                    Session Modes
                  </label>
                  <input
                    id="sessionModes"
                    name="sessionModes"
                    value={formData.sessionModes}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Video, Audio, In-person"
                  />
                  <span className={styles.hint}>Comma separated</span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Icon icon={ICON_FILE} />
                <span>Therapist Profile Content</span>
              </h2>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="bio">
                  Short Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className={styles.input}
                  rows={2}
                  placeholder="One-line therapist intro"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="bioLong">
                  Long Bio
                </label>
                <textarea
                  id="bioLong"
                  name="bioLong"
                  value={formData.bioLong}
                  onChange={handleChange}
                  className={styles.input}
                  rows={5}
                  placeholder="Detailed therapist biography for profile page"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="quote">
                  Quote
                </label>
                <textarea
                  id="quote"
                  name="quote"
                  value={formData.quote}
                  onChange={handleChange}
                  className={styles.input}
                  rows={2}
                  placeholder="Healing quote shown on profile"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="messageToClient">
                  Message to Client
                </label>
                <textarea
                  id="messageToClient"
                  name="messageToClient"
                  value={formData.messageToClient}
                  onChange={handleChange}
                  className={styles.input}
                  rows={4}
                  placeholder="Warm message block shown in profile page"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="testimonials">
                  Testimonials
                </label>
                <textarea
                  id="testimonials"
                  name="testimonials"
                  value={formData.testimonials}
                  onChange={handleChange}
                  className={styles.input}
                  rows={5}
                  placeholder="One per line: Name | Client since 2023 | Testimonial message"
                />
                <span className={styles.hint}>Format: Name | Client since YYYY | Message</span>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Icon icon={ICON_TAG} />
                <span>Pricing & Media</span>
              </h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="sessionFee">
                    Session Fee (INR)
                  </label>
                  <input
                    id="sessionFee"
                    name="sessionFee"
                    type="number"
                    min="0"
                    value={formData.sessionFee}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="1600"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="sessionDurationMins">
                    Session Duration (Minutes)
                  </label>
                  <input
                    id="sessionDurationMins"
                    name="sessionDurationMins"
                    type="number"
                    min="0"
                    value={formData.sessionDurationMins}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="40"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="introVideoUrl">
                  Intro Video URL
                </label>
                <input
                  id="introVideoUrl"
                  name="introVideoUrl"
                  value={formData.introVideoUrl}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="https://...mp4"
                />
                <div
                  className={styles.formActions}
                  style={{ justifyContent: 'flex-start', paddingTop: 8, marginTop: 0 }}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => videoInputRef.current?.click()}
                    disabled={videoUploading}
                  >
                    <span className={styles.buttonContent}>
                      <Icon icon={ICON_UPLOAD} />
                      <span>{videoUploading ? 'Uploading video...' : 'Upload Intro Video'}</span>
                    </span>
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="introVideoThumbnail">
                  Intro Video Thumbnail URL
                </label>
                <input
                  id="introVideoThumbnail"
                  name="introVideoThumbnail"
                  value={formData.introVideoThumbnail}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="https://...jpg"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="galleryImages">
                  Gallery Images
                </label>
                <input
                  id="galleryImages"
                  name="galleryImages"
                  value={formData.galleryImages}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="https://img1, https://img2"
                />
                <span className={styles.hint}>Comma separated URLs</span>
              </div>
            </section>
          </div>

          <aside className={styles.formSidebar}>
            <h2 className={styles.sectionTitle}>
              <Icon icon={ICON_USER} />
              <span>Profile Image</span>
            </h2>
            <div className={styles.imageUploadWrapper}>
              <ImageUpload
                onUpload={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                initialUrl={formData.image}
                label="Upload photo"
                tone="light"
              />
            </div>
            <span className={styles.hint}>Square, 400x400px min</span>
          </aside>
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
