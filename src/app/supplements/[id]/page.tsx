'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import StatusState from '@/components/common/StatusState';
import LottieLoader from '@/components/common/LottieLoader';
import { ProductImageGallery, ProductInfo, ProductTabs } from '@/components/Supplements/ProductDetail';
import { Supplement } from '@/types/supplement.types';
import { supplementsApi } from '@/lib/api/supplements';
import { cartApi } from '@/lib/api/cart';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/routesConstants';
import { trackViewItem, trackAddToCart } from '@/utils/analytics';
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

  const fetchSupplement = useCallback(async () => {
    const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
    if (!id) {
      setSupplement(null);
      setError('Supplement not found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await supplementsApi.getById(id);
      if (response.success && response.data) {
        setSupplement(response.data);
        trackViewItem({
          currency: 'INR',
          value: response.data.price,
          items: [
            {
              item_id: response.data._id,
              item_name: response.data.name,
              item_category: 'Supplements',
              price: response.data.price,
              quantity: 1,
            },
          ],
        });
      } else {
        setSupplement(null);
        setError('Supplement not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supplement');
      setSupplement(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchSupplement();
    }
  }, [params.id, fetchSupplement]);

  const handleAddToCart = async () => {
    if (!supplement) return;
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
        trackAddToCart({
          currency: 'INR',
          value: supplement.price * quantity,
          items: [
            {
              item_id: supplement._id,
              item_name: supplement.name,
              item_category: 'Supplements',
              price: supplement.price,
              quantity,
            },
          ],
        });
        setSuccessMessage('Added to cart successfully!');
        setTimeout(() => {
          router.push('/supplements/cart');
        }, 1000);
      } else {
        setError('Failed to add to cart');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <div className={styles.loading}>
            <LottieLoader width={200} height={200} />
          </div>
        </div>
      </Sidebar>
    );
  }

  if (error && !supplement) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <StatusState
            type="error"
            title="Failed to load product"
            message={error}
            action={
              <div className={styles.actions}>
                <button type="button" onClick={fetchSupplement} className={styles.retryButton}>
                  Try again
                </button>
                <Link href="/supplements" className={styles.backLink}>
                  Back to supplements
                </Link>
              </div>
            }
          />
        </div>
      </Sidebar>
    );
  }

  if (!supplement) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <StatusState
            type="empty"
            title="Product not found"
            message="The product you're looking for doesn't exist or has been removed."
            action={
              <Link href="/supplements" className={styles.backLink}>
                Back to supplements
              </Link>
            }
          />
        </div>
      </Sidebar>
    );
  }

  const isOutOfStock = supplement.stock === 0;
  const maxQuantity = Math.min(supplement.stock, 10);
  const discountPercent =
    supplement.originalPrice && supplement.originalPrice > supplement.price
      ? Math.round(((supplement.originalPrice - supplement.price) / supplement.originalPrice) * 100)
      : undefined;
  const mainImage = supplement.images?.length ? supplement.images[0] : supplement.image;

  return (
    <Sidebar>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.imageSection}>
            <ProductImageGallery
              mainImage={mainImage || supplement.image}
              images={supplement.images}
              discountPercent={discountPercent}
              alt={supplement.name}
            />
          </div>
          <div className={styles.detailsSection}>
            <ProductInfo
              supplement={supplement}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              adding={adding}
              isOutOfStock={isOutOfStock}
              maxQuantity={maxQuantity}
              successMessage={successMessage}
              error={error}
            />
          </div>
        </div>
        <ProductTabs supplement={supplement} />
      </div>
    </Sidebar>
  );
}
