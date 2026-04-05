'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import { SupplementFormData } from '@/types/supplement.types';
import { Input, Button } from '@/components/common';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import { Icon } from '@iconify/react';
import { ICON_PEN, ICON_WALLET, ICON_CLIPBOARD, ICON_CAMERA, ICON_INFO } from '@/constants/icons';
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
      newErrors.originalPrice = 'Original price must exceed selling price';
    }

    const imageExtRegex = /\.(jpg|jpeg|png|webp|avif)$/i;
    if (
      formData.image &&
      !imageExtRegex.test(formData.image) &&
      !formData.image.startsWith('https://res.cloudinary.com')
    ) {
      newErrors.image = 'Invalid image URL or extension';
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
            <p className={styles.sectionSubtitle}>Define the core identity of this supplement</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
            showRequiredIndicator
            labelIcon={
              <div className={styles.tooltipRoot}>
                <Icon icon={ICON_INFO} className={styles.infoIcon} />
                <span className={styles.tooltipText}>The official name of the product seen by customers</span>
              </div>
            }
          />
          <Input
            label="Short Description"
            value={formData.shortDescription || ''}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            placeholder="One-line tagline (e.g. For better sleep)"
            labelIcon={
              <div className={styles.tooltipRoot}>
                <Icon icon={ICON_INFO} className={styles.infoIcon} />
                <span className={styles.tooltipText}>Displayed under the product name on listing pages</span>
              </div>
            }
          />
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label className={styles.label} htmlFor="supplement-description">
              Full Description
              <div className={styles.tooltipRoot}>
                <Icon icon={ICON_INFO} className={styles.infoIcon} />
                <span className={styles.tooltipText}>Detailed product information, benefits, and stories</span>
              </div>
              {errors.description && <span className={styles.errorText}> — {errors.description}</span>}
            </label>
            <textarea
              id="supplement-description"
              className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide a professional description..."
              required
              rows={4}
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
            <p className={styles.sectionSubtitle}>Manage costs and availability</p>
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
            labelIcon={
              <div className={styles.tooltipRoot}>
                <Icon icon={ICON_INFO} className={styles.infoIcon} />
                <span className={styles.tooltipText}>The final price customers will pay</span>
              </div>
            }
          />
          <Input
            label="Original Price (₹)"
            type="number"
            value={formData.originalPrice != null ? formData.originalPrice.toString() : ''}
            onChange={(e) => handleChange('originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            error={errors.originalPrice}
            min="0"
            step="0.01"
            labelIcon={
              <div className={styles.tooltipRoot}>
                <Icon icon={ICON_INFO} className={styles.infoIcon} />
                <span className={styles.tooltipText}>Optional: Show a &quot;slashed&quot; price for discounts</span>
              </div>
            }
          />
          <Input
            label="Stock Quantity"
            type="number"
            value={formData.stock.toString()}
            onChange={(e) => handleChange('stock', parseInt(e.target.value, 10) || 0)}
            error={errors.stock}
            required
            min="0"
            labelIcon={
              <div className={styles.tooltipRoot}>
                <Icon icon={ICON_INFO} className={styles.infoIcon} />
                <span className={styles.tooltipText}>Total number of units available in warehouse</span>
              </div>
            }
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
            <p className={styles.sectionSubtitle}>Specific product attributes and instructions</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <Input
            label="Ingredients"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            placeholder="e.g. Ashwagandha, Melatonin"
            labelIcon={
              <div className={styles.tooltipRoot}>
                <Icon icon={ICON_INFO} className={styles.infoIcon} />
                <span className={styles.tooltipText}>Comma-separated list of ingredients</span>
              </div>
            }
          />
          <Input
            label="Benefits"
            value={benefitsText}
            onChange={(e) => setBenefitsText(e.target.value)}
            placeholder="e.g. Calm mind, Better sleep"
            labelIcon={
              <div className={styles.tooltipRoot}>
                <Icon icon={ICON_INFO} className={styles.infoIcon} />
                <span className={styles.tooltipText}>Comma-separated list of key benefits</span>
              </div>
            }
          />
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label className={styles.label} htmlFor="supplement-suggestedUse">
              Suggested Use
              <div className={styles.tooltipRoot}>
                <Icon icon={ICON_INFO} className={styles.infoIcon} />
                <span className={styles.tooltipText}>How should customers use this product?</span>
              </div>
            </label>
            <textarea
              id="supplement-suggestedUse"
              className={styles.textarea}
              value={formData.suggestedUse || ''}
              onChange={(e) => handleChange('suggestedUse', e.target.value)}
              placeholder="e.g. Take 1-2 capsules 30 minutes before bed"
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* ── Media & Visuals ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={`${styles.sectionIcon} ${styles.sectionIconMedia}`}>
            <Icon icon={ICON_CAMERA} width={18} height={18} />
          </div>
          <div>
            <h3 className={styles.sectionTitle}>Media & Visuals</h3>
            <p className={styles.sectionSubtitle}>Photos and gallery images</p>
          </div>
        </div>
        <div className={styles.mediaGrid}>
          <div className={styles.mediaPrimary}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Featured Image
                <div className={styles.tooltipRoot}>
                  <Icon icon={ICON_INFO} className={styles.infoIcon} />
                  <span className={styles.tooltipText}>Primary image shown on all listings (Upload or URL)</span>
                </div>
              </label>
              <div className={styles.imageSelector}>
                <ImageUpload
                  onUpload={(url) => handleChange('image', url)}
                  onLoadingChange={handleImageLoading}
                  initialUrl={formData.image}
                  label="Upload Photo"
                  tone="light"
                />
                <div className={styles.urlInputGroup}>
                  <div className={styles.separatorText}>
                    <span>OR PROVIDE URL</span>
                  </div>
                  <Input
                    label=""
                    placeholder="Enter image URL..."
                    value={formData.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                    className={styles.urlInput}
                    containerClassName={styles.urlInputContainer}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.mediaSecondary}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="supplement-galleryUrls">
                Additional Gallery URLs
                {imagesText.split(',').filter((url) => url.trim()).length > 0 && (
                  <span className={styles.countBadge}>
                    ({imagesText.split(',').filter((url) => url.trim()).length} images)
                  </span>
                )}
                <div className={styles.tooltipRoot}>
                  <Icon icon={ICON_INFO} className={styles.infoIcon} />
                  <span className={styles.tooltipText}>
                    Provide multiple URLs separated by commas; thumbnails will appear below for verification
                  </span>
                </div>
              </label>
              <textarea
                id="supplement-galleryUrls"
                className={styles.textarea}
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                rows={4}
              />
              <p className={styles.fieldHint}>Ensure URLs end in .jpg, .png, .webp, or .avif</p>

              {/* Gallery Preview Grid */}
              {imagesText.split(',').filter((url) => url.trim().length > 0).length > 0 && (
                <div className={styles.galleryPreviewGrid}>
                  {imagesText.split(',').map((url, idx) => {
                    const trimmedUrl = url.trim();
                    if (!trimmedUrl) return null;
                    return (
                      <div key={trimmedUrl} className={styles.galleryPreviewItem}>
                        <div className={styles.galleryPreviewThumbWrapper}>
                          <NextImage
                            src={trimmedUrl}
                            alt={`Gallery ${idx + 1}`}
                            fill
                            className={styles.galleryPreviewThumb}
                            unoptimized
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
