"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/components/Sidebar/LazySidebar";
import { Supplement } from "@/types/supplement.types";
import QuantitySelector from "@/components/common/QuantitySelector";
import Button from "@/components/common/Button";
import { formatPrice } from "@/utils/cart.util";
import api from "@/lib/axios";
import styles from "./styles.module.css";

export default function SupplementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddToCart = async () => {
    if (!supplement) {
      return;
    }
    setAdding(true);
    try {
      const response = (await api.post("/cart", {
        supplementId: supplement._id,
        quantity,
      })) as { success: boolean };
      if (response.success) {
        alert("Added to cart successfully!");
        router.push("/supplements/cart");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add to cart";
      alert(message);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchSupplement();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
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

  const isOutOfStock = supplement.stock === 0;
  const maxQuantity = Math.min(supplement.stock, 10);

  return (
    <Sidebar>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.imageSection}>
            <Image
              src={supplement.image || "/default-supplement.png"}
              alt={supplement.name}
              width={500}
              height={500}
              className={styles.image}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-supplement.png";
              }}
            />
          </div>
          <div className={styles.detailsSection}>
            <h1 className={styles.title}>{supplement.name}</h1>
            <p className={styles.category}>{supplement.category}</p>
            <div className={styles.price}>{formatPrice(supplement.price)}</div>
            <p className={styles.description}>{supplement.description}</p>
            {supplement.ingredients.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Ingredients</h3>
                <ul className={styles.list}>
                  {supplement.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}
            {supplement.benefits.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Benefits</h3>
                <ul className={styles.list}>
                  {supplement.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className={styles.stockInfo}>
              {isOutOfStock ? (
                <span className={styles.outOfStock}>Out of Stock</span>
              ) : (
                <span className={styles.inStock}>
                  In Stock ({supplement.stock} available)
                </span>
              )}
            </div>
            {!isOutOfStock && (
              <div className={styles.actions}>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={maxQuantity}
                  disabled={adding}
                />
                <Button
                  variant="primary"
                  onClick={handleAddToCart}
                  loading={adding}
                  disabled={adding || isOutOfStock}
                  className={styles.addButton}
                >
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
