'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../add/styles.module.css';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import { FaArrowLeft, FaPenToSquare } from 'react-icons/fa6';
import LottieLoader from '@/components/common/LottieLoader';

export default function EditTherapistPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const response = await fetch(`/api/therapists/${params.id}`);
        const result = await response.json();
        if (result.success) {
          const data = result.data;
          setFormData({
            name: data.name,
            email: data.email || '',
            qualifications: data.qualifications?.join(', ') || '',
            experience: data.experience || '',
            languages: data.languages?.join(', ') || '',
            specializations: data.specializations?.join(', ') || '',
            image: data.image || '',
          });
        } else {
          setError('Failed to fetch therapist details');
          router.push('/admin/therapists');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching therapist details');
      } finally {
        setInitialLoading(false);
      }
    };

    if (params.id) {
      fetchTherapist();
    }
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      const response = await fetch(`/api/therapists/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/admin/therapists');
      } else {
        setError('Failed to update therapist');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/admin/therapists" className={styles.backLink}>
            <FaArrowLeft />
            <span>Back to Therapists</span>
          </Link>
          <h1 className={styles.title}>Edit Therapist</h1>
        </header>
        <div className={styles.form} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <LottieLoader width={80} height={80} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin/therapists" className={styles.backLink}>
          <FaArrowLeft />
          <span>Back to Therapists</span>
        </Link>
        <h1 className={styles.title}>Edit Therapist</h1>
        <p className={styles.subtitle}>Update therapist profile information</p>
      </header>

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
                <span>Updating...</span>
              </span>
            ) : (
              <span className={styles.buttonContent}>
                <FaPenToSquare />
                <span>Update Therapist</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
