'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar/LazySidebar';
import { Supplement } from '@/types/supplement.types';
import QuantitySelector from '@/components/common/QuantitySelector';
import Button from '@/components/common/Button';
import { formatPrice } from '@/utils/cart.util';
import { supplementsApi } from '@/lib/api/supplements';
import { cartApi } from '@/lib/api/cart';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/routesConstants';
import styles from './styles.module.css';

export default function SupplementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSupplement = async () => {
    try {
      const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
      if (!id) {
        setSupplement(null);
        setError('Supplement not found');
        return;
      }
      setLoading(true);
      setError(null);
      const response = await supplementsApi.getById(id);
      if (response.success && response.data) {
        setSupplement(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supplement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!supplement) {
      return;
    }
    if (!isAuthenticated) {
      const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
      const currentPath = `/supplements/${id}`;
      const returnUrl = encodeURIComponent(currentPath);
      router.push(`${ROUTES.LOGIN}?returnUrl=${returnUrl}`);
      return;
    }
    setAdding(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await cartApi.add(supplement._id, quantity);
      if (response.success) {
        setSuccessMessage('Added to cart successfully!');
        setTimeout(() => {
          router.push('/supplements/cart');
        }, 1000);
      } else {
        setError('Failed to add to cart');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      setError(message);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchSupplement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className={styles.error}>{error || 'Supplement not found'}</div>
      </div>
    );
  }

  const isOutOfStock = supplement.stock === 0;
  const maxQuantity = Math.min(supplement.stock, 10);

  return (
    <Sidebar>
      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}
        <div className={styles.content}>
          <div className={styles.imageSection}>
            <Image
              src={supplement.image || '/default-supplement.png'}
              alt={supplement.name}
              width={500}
              height={500}
              className={styles.image}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-supplement.png';
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
                  {supplement.ingredients.map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}
            {supplement.benefits.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Benefits</h3>
                <ul className={styles.list}>
                  {supplement.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className={styles.stockInfo}>
              {isOutOfStock ? (
                <span className={styles.outOfStock}>Out of Stock</span>
              ) : (
                <span className={styles.inStock}>In Stock ({supplement.stock} available)</span>
              )}
            </div>
            {!isOutOfStock && (
              <div className={styles.actions}>
                <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={maxQuantity} disabled={adding} />
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
