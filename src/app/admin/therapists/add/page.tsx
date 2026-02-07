'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './styles.module.css';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import PageHeader from '@/components/PageHeader/PageHeader';
import { FaArrowLeft, FaUserPlus } from 'react-icons/fa6';

export default function AddTherapistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    qualifications: '',
    experience: '',
    languages: '',
    specializations: '',
    image: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        qualifications: formData.qualifications
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        languages: formData.languages
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        specializations: formData.specializations
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const response = await fetch('/api/therapists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
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
        subtitle="Create a new therapist profile for your platform"
        actions={
          <Link href="/admin/therapists" className={styles.backLink}>
            <FaArrowLeft aria-hidden />
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
              <h2 className={styles.sectionTitle}>Basic Information</h2>
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
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Professional Details</h2>
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
              </div>
            </section>
          </div>

          <aside className={styles.formSidebar}>
            <h2 className={styles.sectionTitle}>Profile Image</h2>
            <div className={styles.imageUploadWrapper}>
              <ImageUpload
                onUpload={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                initialUrl={formData.image}
                label="Upload photo"
              />
            </div>
            <span className={styles.hint}>Square, 400x400px min</span>
          </aside>
        </div>

        <div className={styles.formActions}>
          <Link href="/admin/therapists" className={styles.cancelButton}>
            Cancel
          </Link>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? (
              <span className={styles.buttonContent}>
                <span className={styles.spinner} />
                <span>Creating...</span>
              </span>
            ) : (
              <span className={styles.buttonContent}>
                <FaUserPlus />
                <span>Create Therapist</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
