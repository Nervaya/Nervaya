"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

export default function AdminTherapiesPage() {
    const [therapies, setTherapies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTherapies = async () => {
        try {
            const response = await fetch('/api/therapies');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setTherapies(result.data);
                } else if (Array.isArray(result)) {
                    setTherapies(result);
                }
            }
        } catch (error) {
            console.error('Failed to fetch therapies', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTherapies();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`WARNING: Are you sure you want to delete the therapy "${title}"? This action cannot be undone.`)) return;

        try {
            const response = await fetch(`/api/therapies/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchTherapies();
            } else {
                alert('Failed to delete therapy');
            }
        } catch (error) {
            console.error('Error deleting therapy', error);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h2>Manage Therapies</h2>
                <Link href="/admin/therapies/add" className={styles.addButton}>
                    Add New Therapy
                </Link>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className={styles.list}>
                    {therapies.map((therapy) => (
                        <div key={therapy._id} className={styles.card}>
                            <div className={styles.therapyInfo}>
                                <img
                                    src={therapy.image || '/default-therapy.png'}
                                    alt={therapy.title}
                                    className={styles.therapyImage}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=' + encodeURIComponent(therapy.title.substring(0, 2));
                                    }}
                                />
                                <div className={styles.details}>
                                    <h3>{therapy.title}</h3>
                                    <p className={styles.doctorName}>
                                        by Dr. {therapy.doctorId?.name || 'Unknown'}
                                    </p>

                                    <div className={styles.metrics}>
                                        <span className={styles.metricItem}>
                                            <span style={{ fontSize: '1.2em' }}>⏱️</span> {therapy.durationMinutes} min
                                        </span>
                                        <span className={styles.metricItem}>
                                            <span className={styles.price}>{therapy.currency} {therapy.price}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <Link
                                    href={`/admin/therapies/edit/${therapy._id}`}
                                    className={styles.editButton}
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(therapy._id, therapy.title)}
                                    className={styles.deleteButton}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {therapies.length === 0 && <p>No therapies found.</p>}
                </div>
            )}
        </div>
    );
}