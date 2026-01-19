'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CURRENCY } from '@/utils/currencyConstants';
import { Doctor } from '@/types/doctor.types';
import styles from './styles.module.css';
import ImageUpload from '@/components/ImageUpload/ImageUpload';

export default function AddTherapyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    title: '',
    durationMinutes: '',
    price: '',
    currency: CURRENCY.CODE,
    image: '',
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDoctors(result.data);
          } else if (Array.isArray(result)) {
            setDoctors(result);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
           
          console.error('Failed to fetch doctors', error);
        }
      }
    };
    fetchDoctors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        durationMinutes: Number(formData.durationMinutes),
        price: Number(formData.price),
      };

      const response = await fetch('/api/therapies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/admin/therapies');
      } else {
        // eslint-disable-next-line no-alert
        alert('Failed to create therapy');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating therapy', error);
      }
      // eslint-disable-next-line no-alert
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add New Therapy</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Doctor</label>
          <select name="doctorId" value={formData.doctorId} onChange={handleChange} required className={styles.select}>
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Title</label>
          <input name="title" value={formData.title} onChange={handleChange} required className={styles.input} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Duration (minutes)</label>
          <input type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} required className={styles.input} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Price</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required className={styles.input} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Currency</label>
          <input name="currency" value={formData.currency} onChange={handleChange} className={styles.input} />
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
          {loading ? 'Creating...' : 'Create Therapy'}
        </button>
      </form>
    </div>
  );
}
