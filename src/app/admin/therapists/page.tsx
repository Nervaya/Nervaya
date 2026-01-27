"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/components/common/Loader";
import { Therapist } from "@/types/therapist.types";
import styles from "./styles.module.css";

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTherapists = async () => {
    try {
      const response = await fetch("/api/therapists");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTherapists(result.data);
        } else if (Array.isArray(result)) {
          setTherapists(result);
        }
      }
    } catch (error) {
      // Error handling - could be improved with proper error logging service
      if (error instanceof Error) {
        console.error("Failed to fetch therapists", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const message = `WARNING: Are you sure you want to delete ${name}? This action cannot be undone.`;
    // eslint-disable-next-line no-alert
    if (!confirm(message)) {
      return;
    }

    try {
      const response = await fetch(`/api/therapists/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTherapists(); // Refresh list
      } else {
        // eslint-disable-next-line no-alert
        alert("Failed to delete therapist");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error deleting therapist", error);
      }
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h2>Manage Therapists</h2>
        <Link href="/admin/therapists/add" className={styles.addButton}>
          Add New Therapist
        </Link>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "60px 20px",
          }}
        >
          <Loader size="lg" text="Loading therapists..." />
        </div>
      ) : (
        <div className={styles.list}>
          {therapists.map((therapist) => (
            <div key={therapist._id} className={styles.card}>
              <div className={styles.therapistInfo}>
                <Image
                  src={therapist.image || "/default-therapist.png"}
                  alt={therapist.name}
                  width={100}
                  height={100}
                  className={styles.therapistImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&background=random`;
                  }}
                />
                <div className={styles.details}>
                  <h3>{therapist.name}</h3>
                  <p className={styles.qualifications}>
                    {therapist.qualifications?.join(", ")}
                  </p>

                  <div className={styles.infoRow}>
                    <span className={styles.infoItem}>
                      <strong>Exp:</strong> {therapist.experience}
                    </span>
                    <span className={styles.infoItem}>
                      <strong>Lang:</strong> {therapist.languages?.join(", ")}
                    </span>
                  </div>

                  <div className={styles.chips}>
                    {therapist.specializations?.map((spec: string) => (
                      <span key={spec} className={styles.chip}>
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.actions}>
                <Link
                  href={`/admin/therapists/${therapist._id}/slots`}
                  className={styles.slotsButton}
                >
                  Manage Slots
                </Link>
                <Link
                  href={`/admin/therapists/edit/${therapist._id}`}
                  className={styles.editButton}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(therapist._id, therapist.name)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {therapists.length === 0 && <p>No therapists found.</p>}
        </div>
      )}
    </div>
  );
}
