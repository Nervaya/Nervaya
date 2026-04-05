'use client';

import React, { useState } from 'react';
import { SupplementFormData } from '@/types/supplement.types';
import { Input, Button } from '@/components/common';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import { Icon } from '@iconify/react';
import { ICON_PEN, ICON_WALLET, ICON_CLIPBOARD, ICON_CAMERA } from '@/constants/icons';
import styles from './styles.module.css';

interface SupplementFormProps {
  onSubmit: (data: SupplementFormData) => Promise<void>;
  initialData?: Partial<SupplementFormData>;
  loading?: boolean;
  submitLabel?: string;
}

const SupplementForm: React.FC<SupplementFormProps> = ({
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Create Supplement',
}) => {
  const [formData, setFormData] = useState<SupplementFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price ?? 0,
    image: initialData?.image || '',
    stock: initialData?.stock ?? 0,
    ingredients: initialData?.ingredients || [],
    benefits: initialData?.benefits || [],
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    originalPrice: initialData?.originalPrice,
    shortDescription: initialData?.shortDescription || '',
    suggestedUse: initialData?.suggestedUse || '',
    images: initialData?.images || [],
    capsuleCount: initialData?.capsuleCount,
    unitLabel: initialData?.unitLabel || '',
  });

  const [ingredientsText, setIngredientsText] = useState(initialData?.ingredients?.join(', ') || '');
  const [benefitsText, setBenefitsText] = useState(initialData?.benefits?.join(', ') || '');
  const [imagesText, setImagesText] = useState(initialData?.images?.join(', ') || '');
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SupplementFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SupplementFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (formData.originalPrice != null && formData.originalPrice > 0 && formData.originalPrice < formData.price) {
      newErrors.originalPrice = 'Original price must be greater than or equal to price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const galleryUrls = imagesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const submitData: SupplementFormData = {
      ...formData,
      ingredients: ingredientsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      benefits: benefitsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      images: galleryUrls.length > 0 ? galleryUrls : undefined,
      originalPrice: formData.originalPrice != null && formData.originalPrice > 0 ? formData.originalPrice : undefined,
      capsuleCount: formData.capsuleCount != null && formData.capsuleCount > 0 ? formData.capsuleCount : undefined,
      unitLabel: formData.unitLabel?.trim() || undefined,
      shortDescription: formData.shortDescription?.trim() || undefined,
      suggestedUse: formData.suggestedUse?.trim() || undefined,
    };

    await onSubmit(submitData);
  };

  const handleChange = (field: keyof SupplementFormData, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageLoading = (isLoading: boolean) => {
    setImageUploading(isLoading);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {/* ── Basic Information ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={`${styles.sectionIcon} ${styles.sectionIconInfo}`}>
            <Icon icon={ICON_PEN} width={18} height={18} />
          </div>
          <div>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <p className={styles.sectionSubtitle}>Product name and description</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
          />
          <Input
            label="Short Description"
            value={formData.shortDescription || ''}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            placeholder="One-line tagline for product page"
          />
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label className={styles.label} htmlFor="supplement-description">
              Full Description
              {errors.description && <span className={styles.errorText}> — {errors.description}</span>}
            </label>
            <textarea
              id="supplement-description"
              className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed product description..."
              required
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* ── Pricing & Inventory ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={`${styles.sectionIcon} ${styles.sectionIconPricing}`}>
            <Icon icon={ICON_WALLET} width={18} height={18} />
          </div>
          <div>
            <h3 className={styles.sectionTitle}>Pricing & Inventory</h3>
            <p className={styles.sectionSubtitle}>Set pricing, stock levels, and packaging</p>
          </div>
        </div>
        <div className={`${styles.formGrid} ${styles.threeCol}`}>
          <Input
            label="Selling Price (₹)"
            type="number"
            value={formData.price.toString()}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            error={errors.price}
            required
            min="0"
            step="0.01"
          />
          <Input
            label="Original Price (₹)"
            type="number"
            value={formData.originalPrice != null ? formData.originalPrice.toString() : ''}
            onChange={(e) => handleChange('originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            error={errors.originalPrice}
            min="0"
            step="0.01"
          />
          <Input
            label="Stock Quantity"
            type="number"
            value={formData.stock.toString()}
            onChange={(e) => handleChange('stock', parseInt(e.target.value, 10) || 0)}
            error={errors.stock}
            required
            min="0"
          />
          <Input
            label="Capsule Count"
            type="number"
            value={formData.capsuleCount != null ? formData.capsuleCount.toString() : ''}
            onChange={(e) => handleChange('capsuleCount', e.target.value ? parseInt(e.target.value, 10) : undefined)}
            min="0"
            placeholder="e.g. 60"
          />
          <Input
            label="Unit Label"
            value={formData.unitLabel || ''}
            onChange={(e) => handleChange('unitLabel', e.target.value)}
            placeholder="e.g. 60 capsules total"
          />
        </div>
      </section>

      {/* ── Details ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={`${styles.sectionIcon} ${styles.sectionIconDetails}`}>
            <Icon icon={ICON_CLIPBOARD} width={18} height={18} />
          </div>
          <div>
            <h3 className={styles.sectionTitle}>Product Details</h3>
            <p className={styles.sectionSubtitle}>Ingredients, benefits, and usage instructions</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <Input
            label="Ingredients"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            placeholder="Vitamin D, Calcium, Magnesium"
          />
          <Input
            label="Benefits"
            value={benefitsText}
            onChange={(e) => setBenefitsText(e.target.value)}
            placeholder="Better sleep, Reduced anxiety"
          />
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label className={styles.label} htmlFor="supplement-suggestedUse">
              Suggested Use
            </label>
            <textarea
              id="supplement-suggestedUse"
              className={styles.textarea}
              value={formData.suggestedUse || ''}
              onChange={(e) => handleChange('suggestedUse', e.target.value)}
              placeholder="e.g. Take one capsule daily before bed with water"
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* ── Media ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={`${styles.sectionIcon} ${styles.sectionIconMedia}`}>
            <Icon icon={ICON_CAMERA} width={18} height={18} />
          </div>
          <div>
            <h3 className={styles.sectionTitle}>Media</h3>
            <p className={styles.sectionSubtitle}>Product image and gallery</p>
          </div>
        </div>
        <div className={styles.mediaGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Product Image</label>
            <ImageUpload
              onUpload={(url) => handleChange('image', url)}
              onLoadingChange={handleImageLoading}
              initialUrl={formData.image}
              label="Upload Product Image"
            />
          </div>
          <div className={styles.mediaSecondary}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="supplement-galleryUrls">
                Gallery Image URLs
              </label>
              <input
                id="supplement-galleryUrls"
                type="text"
                className={styles.input}
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                placeholder="Comma-separated image URLs"
              />
              <p className={styles.fieldHint}>Add multiple image URLs separated by commas for the product gallery</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <div
          className={styles.toggleWrapper}
          onClick={() => handleChange('isActive', !formData.isActive)}
          role="switch"
          aria-checked={formData.isActive}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleChange('isActive', !formData.isActive);
            }
          }}
        >
          <div className={`${styles.toggleTrack} ${formData.isActive ? styles.toggleTrackActive : ''}`}>
            <div className={`${styles.toggleThumb} ${formData.isActive ? styles.toggleThumbActive : ''}`} />
          </div>
          <span className={styles.toggleLabel}>Visibility</span>
          <span
            className={`${styles.toggleStatus} ${formData.isActive ? styles.toggleStatusActive : styles.toggleStatusInactive}`}
          >
            {formData.isActive ? 'Active' : 'Hidden'}
          </span>
        </div>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={imageUploading}
          className={styles.submitButton}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default SupplementForm;
