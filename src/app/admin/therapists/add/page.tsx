'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import ImageUpload from '@/components/ImageUpload/ImageUpload';

export default function AddTherapistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        qualifications: formData.qualifications.split(',').map(s => s.trim()).filter(Boolean),
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(Boolean),
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
        // eslint-disable-next-line no-alert
        alert('Failed to create therapist');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating therapist', error);
      }
      // eslint-disable-next-line no-alert
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add New Therapist</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required className={styles.input} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} className={styles.input} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Qualifications (comma separated)</label>
          <input name="qualifications" value={formData.qualifications} onChange={handleChange} required className={styles.input} placeholder="M.A. Psychology, Licensed Therapist" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Experience</label>
          <input name="experience" value={formData.experience} onChange={handleChange} required className={styles.input} placeholder="10+ years" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Languages (comma separated)</label>
          <input name="languages" value={formData.languages} onChange={handleChange} required className={styles.input} placeholder="English, Hindi" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Specializations (comma separated)</label>
          <input name="specializations" value={formData.specializations} onChange={handleChange} required className={styles.input} placeholder="Anxiety, Depression, Sleep Disorders" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Image</label>
          <ImageUpload
            onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
            initialUrl={formData.image}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Creating...' : 'Create Therapist'}
        </button>
      </form>
    </div>
  );
}
