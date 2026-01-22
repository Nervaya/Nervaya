'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../add/styles.module.css'; // Reusing styles from Add page
import ImageUpload from '@/components/ImageUpload/ImageUpload';

export default function EditTherapistPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    qualifications: '', // Comma separated
    experience: '',
    languages: '', // Comma separated
    specializations: '', // Comma separated
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
          // eslint-disable-next-line no-alert
          alert('Failed to fetch therapist details');
          router.push('/admin/therapists');
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching therapist:', error);
        }
        // eslint-disable-next-line no-alert
        alert('Error fetching therapist details');
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
        // eslint-disable-next-line no-alert
        alert('Failed to update therapist');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating therapist', error);
      }
      // eslint-disable-next-line no-alert
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className={styles.container}><p>Loading therapist details...</p></div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Therapist</h2>
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
          {loading ? 'Updating...' : 'Update Therapist'}
        </button>
      </form>
    </div>
  );
}
