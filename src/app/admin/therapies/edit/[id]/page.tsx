"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../add/styles.module.css'; // Reusing styles from Add page
import ImageUpload from '@/components/ImageUpload/ImageUpload';

export default function EditTherapyPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        doctorId: '',
        title: '',
        durationMinutes: '',
        price: '',
        currency: 'INR',
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
                console.error('Failed to fetch doctors', error);
            }
        };

        const fetchTherapy = async () => {
            try {
                const response = await fetch(`/api/therapies/${params.id}`);
                const result = await response.json();
                if (result.success) {
                    const data = result.data;
                    setFormData({
                        doctorId: data.doctorId?._id || data.doctorId, // Handle populated or unpopulated
                        title: data.title,
                        durationMinutes: String(data.durationMinutes),
                        price: String(data.price),
                        currency: data.currency,
                        image: data.image || '',
                    });
                } else {
                    alert('Failed to fetch therapy details');
                    router.push('/admin/therapies');
                }
            } catch (error) {
                console.error('Error fetching therapy:', error);
                alert('Error fetching therapy details');
            } finally {
                setInitialLoading(false);
            }
        };

        if (params.id) {
            Promise.all([fetchDoctors(), fetchTherapy()]);
        }
    }, [params.id, router]);

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

            const response = await fetch(`/api/therapies/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                router.push('/admin/therapies');
            } else {
                alert('Failed to update therapy');
            }
        } catch (error) {
            console.error('Error updating therapy', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className={styles.container}><p>Loading therapy details...</p></div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Edit Therapy</h2>
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
                    {loading ? 'Updating...' : 'Update Therapy'}
                </button>
            </form>
        </div>
    );
}
