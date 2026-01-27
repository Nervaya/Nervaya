"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Supplement } from "@/types/supplement.types";
import { formatPrice } from "@/utils/cart.util";
import styles from "./styles.module.css";

interface SupplementListProps {
  supplements: Supplement[];
  onDelete?: (id: string) => void;
  onEdit?: (supplement: Supplement) => void;
  loading?: boolean;
}

const SupplementList: React.FC<SupplementListProps> = ({
  supplements,
  onDelete,
  onEdit,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = ["all", ...new Set(supplements.map((s) => s.category))];

  const filteredSupplements = supplements.filter((supplement) => {
    const matchesSearch =
      supplement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || supplement.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!onDelete) {
      return;
    }
    const message = `Are you sure you want to delete "${name}"? This action cannot be undone.`;
    if (window.confirm(message)) {
      onDelete(id);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading supplements...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search supplements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.categorySelect}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {filteredSupplements.length === 0 ? (
        <div className={styles.empty}>
          <p>No supplements found</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredSupplements.map((supplement) => (
            <div key={supplement._id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={supplement.image || "/default-supplement.png"}
                  alt={supplement.name}
                  width={120}
                  height={120}
                  className={styles.image}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/default-supplement.png";
                  }}
                />
                {!supplement.isActive && (
                  <div className={styles.inactiveBadge}>Inactive</div>
                )}
              </div>
              <div className={styles.details}>
                <h3 className={styles.name}>{supplement.name}</h3>
                <p className={styles.category}>{supplement.category}</p>
                <p className={styles.description}>
                  {supplement.description.substring(0, 150)}...
                </p>
                <div className={styles.info}>
                  <span className={styles.price}>
                    {formatPrice(supplement.price)}
                  </span>
                  <span className={styles.stock}>
                    Stock: {supplement.stock}
                  </span>
                </div>
              </div>
              <div className={styles.actions}>
                {onEdit ? (
                  <button
                    onClick={() => onEdit(supplement)}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                ) : (
                  <Link
                    href={`/admin/supplements/edit/${supplement._id}`}
                    className={styles.editButton}
                  >
                    Edit
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(supplement._id, supplement.name)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplementList;
