"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Supplement, SupplementFormData } from "@/types/supplement.types";
import SupplementForm from "@/components/Admin/SupplementForm";
import api from "@/lib/axios";
import styles from "./styles.module.css";

export default function EditSupplementPage() {
  const params = useParams();
  const router = useRouter();
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: SupplementFormData) => {
    try {
      setError(null);
      const response = (await api.put(`/supplements/${params.id}`, data)) as {
        success: boolean;
      };
      if (response.success) {
        router.push("/admin/supplements");
      } else {
        setError("Failed to update supplement");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update supplement",
      );
      throw err;
    }
  };

  useEffect(() => {
    const fetchSupplement = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await api.get(`/supplements/${params.id}`)) as {
          success: boolean;
          data: Supplement;
        };
        if (response.success && response.data) {
          setSupplement(response.data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load supplement",
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSupplement();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading supplement...</div>
      </div>
    );
  }

  if (error || !supplement) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || "Supplement not found"}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Supplement</h2>
      {error && <div className={styles.error}>{error}</div>}
      <SupplementForm
        onSubmit={handleSubmit}
        initialData={supplement}
        submitLabel="Update Supplement"
      />
    </div>
  );
}
