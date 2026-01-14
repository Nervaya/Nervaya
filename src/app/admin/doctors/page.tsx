"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

export default function AdminDoctorsPage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`WARNING: Are you sure you want to delete Dr. ${name}? This action cannot be undone.`)) return;

        try {
            const response = await fetch(`/api/doctors/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchDoctors(); // Refresh list
            } else {
                alert('Failed to delete doctor');
            }
        } catch (error) {
            console.error('Error deleting doctor', error);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h2>Manage Doctors</h2>
                <Link href="/admin/doctors/add" className={styles.addButton}>
                    Add New Doctor
                </Link>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className={styles.list}>
                    {doctors.map((doctor) => (
                        <div key={doctor._id} className={styles.card}>
                            <div className={styles.doctorInfo}>
                                <img
                                    src={doctor.image || '/default-doctor.png'}
                                    alt={doctor.name}
                                    className={styles.doctorImage}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doctor.name) + '&background=random';
                                    }}
                                />
                                <div className={styles.details}>
                                    <h3>{doctor.name}</h3>
                                    <p className={styles.qualifications}>{doctor.qualifications?.join(', ')}</p>

                                    <div className={styles.infoRow}>
                                        <span className={styles.infoItem}>
                                            <strong>Exp:</strong> {doctor.experience}
                                        </span>
                                        <span className={styles.infoItem}>
                                            <strong>Lang:</strong> {doctor.languages?.join(', ')}
                                        </span>
                                    </div>

                                    <div className={styles.chips}>
                                        {doctor.specializations?.map((spec: string, index: number) => (
                                            <span key={index} className={styles.chip}>{spec}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <Link
                                    href={`/admin/doctors/edit/${doctor._id}`}
                                    className={styles.editButton}
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(doctor._id, doctor.name)}
                                    className={styles.deleteButton}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {doctors.length === 0 && <p>No doctors found.</p>}
                </div>
            )}
        </div>
    );
}
