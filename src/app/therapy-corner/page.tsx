"use client";

import { useState, useEffect } from 'react';

import Sidebar from '@/components/Sidebar/Sidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import styles from './styles.module.css';

export default function TherapyCornerPage() {
    const [therapies, setTherapies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTherapies = async () => {
            try {
                const response = await fetch('/api/therapies');
                if (!response.ok) {
                    throw new Error('Failed to fetch therapies');
                }
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    setTherapies(result.data);
                } else if (Array.isArray(result)) {
                    // Fallback in case raw array is returned (backward compatibility during dev)
                    setTherapies(result);
                } else {
                    setTherapies([]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTherapies();
    }, []);

    return (
        <Sidebar>
            <div className={styles.container}>
                <PageHeader
                    title="Therapy Corner"
                    subtitle="Finding the right therapist isn't easy."
                    description="Based on your sleep assessment, we've curated a shortlist tailored just for you."
                />

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>✨ Your Recommended Therapists</h2>

                    {loading && <p>Loading recommendations...</p>}
                    {error && <p className={styles.error}>{error}</p>}

                    {!loading && !error && therapies.length === 0 && (
                        <p>No therapists found at the moment.</p>
                    )}

                    {!loading && !error && therapies.map((therapy) => (
                        <div key={therapy._id} className={styles.therapistCard}>
                            <div className={styles.therapistInfo}>
                                <div
                                    className={styles.avatar}
                                    style={therapy.doctorId?.image ? { backgroundImage: `url(${therapy.doctorId.image})` } : {}}
                                ></div>
                                <div>
                                    <h3>{therapy.doctorId?.name || 'Unknown Doctor'}</h3>
                                    <p className={styles.credentials}>
                                        {therapy.doctorId?.qualifications?.join(', ') || 'No qualifications listed'}
                                    </p>
                                    <p className={styles.details}>
                                        Experience: {therapy.doctorId?.experience || 'N/A'} |
                                        Languages: {therapy.doctorId?.languages?.join(', ') || 'N/A'}
                                    </p>
                                    <div className={styles.tags}>
                                        {therapy.doctorId?.specializations?.map((spec: string, index: number) => (
                                            <span key={index}>{spec}</span>
                                        ))}
                                        {/* Fallback or additional tags can be added here if needed */}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <span className={styles.price}>
                                    {therapy.currency} {therapy.price} for {therapy.durationMinutes} min
                                </span>
                                <div className={styles.buttons}>
                                    <button className={styles.outlineBtn}>View Profile</button>
                                    <button className={styles.primaryBtn}>Book Appointment</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </Sidebar>
    );
}
