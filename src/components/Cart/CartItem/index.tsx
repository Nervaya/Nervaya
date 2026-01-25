"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CartItem as CartItemType, Supplement } from "@/types/supplement.types";
import QuantitySelector from "@/components/common/QuantitySelector";
import { formatPrice } from "@/utils/cart.util";
import styles from "./styles.module.css";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange?: (supplementId: string, quantity: number) => void;
  onRemove?: (supplementId: string) => void;
  disabled?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  disabled = false,
}) => {
  const supplement =
    item.supplementId &&
    typeof item.supplementId === "object" &&
    "name" in item.supplementId
      ? (item.supplementId as Supplement)
      : null;
  const supplementId =
    typeof item.supplementId === "object" ? supplement?._id : item.supplementId;
  const supplementName = supplement?.name || "Unknown Product";
  const supplementImage = supplement?.image || "/default-supplement.png";
  const maxStock = supplement?.stock || item.quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (onQuantityChange && supplementId) {
      onQuantityChange(supplementId.toString(), newQuantity);
    }
  };

  const handleRemove = () => {
    if (onRemove && supplementId) {
      onRemove(supplementId.toString());
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className={styles.cartItem}>
      <Link
        href={supplement ? `/supplements/${supplement._id}` : "#"}
        className={styles.imageLink}
      >
        <div className={styles.imageWrapper}>
          <Image
            src={supplementImage}
            alt={supplementName}
            width={100}
            height={100}
            className={styles.image}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-supplement.png";
            }}
          />
        </div>
      </Link>
      <div className={styles.details}>
        <Link
          href={supplement ? `/supplements/${supplement._id}` : "#"}
          className={styles.nameLink}
        >
          <h3 className={styles.name}>{supplementName}</h3>
        </Link>
        <p className={styles.price}>{formatPrice(item.price)} each</p>
        <div className={styles.actions}>
          <QuantitySelector
            value={item.quantity}
            onChange={handleQuantityChange}
            min={1}
            max={maxStock}
            disabled={disabled}
          />
          <button
            className={styles.removeButton}
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove item"
          >
            Remove
          </button>
        </div>
      </div>
      <div className={styles.total}>
        <div className={styles.totalPrice}>{formatPrice(itemTotal)}</div>
      </div>
    </div>
  );
};

export default CartItem;
