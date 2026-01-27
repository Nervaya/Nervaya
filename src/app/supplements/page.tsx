"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/LazySidebar";
import { Supplement } from "@/types/supplement.types";
import SupplementGrid from "@/components/Supplements/SupplementGrid";
import api from "@/lib/axios";
import styles from "./styles.module.css";

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await api.get("/supplements")) as {
        success: boolean;
        data: Supplement[];
      };
      if (response.success && response.data) {
        setSupplements(response.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load supplements",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (supplementId: string, quantity: number) => {
    try {
      setError(null);
      const response = (await api.post("/cart", {
        supplementId,
        quantity,
      })) as { success: boolean };
      if (!response.success) {
        setError("Failed to add to cart");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add to cart";
      setError(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchSupplements();
  }, []);

  return (
    <Sidebar>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Supplements</h1>
          <p className={styles.subtitle}>
            Discover our range of health supplements
          </p>
        </header>
        {error && <div className={styles.error}>{error}</div>}
        <SupplementGrid
          supplements={supplements}
          onAddToCart={handleAddToCart}
          loading={loading}
        />
      </div>
    </Sidebar>
  );
}
