'use client';

import React, { useState } from 'react';
import { SupplementFormData } from '@/types/supplement.types';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import styles from './styles.module.css';

interface SupplementFormProps {
  onSubmit: (data: SupplementFormData) => Promise<void>;
  initialData?: Partial<SupplementFormData>;
  loading?: boolean;
  submitLabel?: string;
  compact?: boolean;
}

function getInitialFormData(initialData?: Partial<SupplementFormData>): SupplementFormData {
  return {
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? 0,
    image: initialData?.image ?? '',
    stock: initialData?.stock ?? 0,
    category: initialData?.category ?? '',
    ingredients: initialData?.ingredients ?? [],
    benefits: initialData?.benefits ?? [],
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  };
}

const SupplementForm: React.FC<SupplementFormProps> = ({
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Create Supplement',
  compact = false,
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
  const [errors, setErrors] = useState<Partial<Record<keyof SupplementFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price ?? 0,
        image: initialData.image || '',
        stock: initialData.stock ?? 0,
        ingredients: initialData.ingredients || [],
        benefits: initialData.benefits || [],
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        originalPrice: initialData.originalPrice,
        shortDescription: initialData.shortDescription || '',
        suggestedUse: initialData.suggestedUse || '',
        images: initialData.images || [],
        capsuleCount: initialData.capsuleCount,
        unitLabel: initialData.unitLabel || '',
      });
      setIngredientsText(initialData.ingredients?.join(', ') || '');
      setBenefitsText(initialData.benefits?.join(', ') || '');
      setImagesText(initialData.images?.join(', ') || '');
    }
  }, [initialData]);

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

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.formGrid}>
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
          compact={compact}
        />
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="supplement-shortDescription">
            Short description (optional)
          </label>
          <input
            id="supplement-shortDescription"
            type="text"
            className={styles.input}
            value={formData.shortDescription || ''}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            placeholder="One-line tagline for product page"
          />
        </div>
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="supplement-description">
            Description
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
          </label>
          <textarea
            id="supplement-description"
            className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            rows={2}
          />
        </div>
        <Input
          label="Price (₹)"
          type="number"
          value={formData.price.toString()}
          onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
          error={errors.price}
          required
          min="0"
          step="0.01"
          compact={compact}
        />
        <Input
          label="Original price (₹) optional"
          type="number"
          value={formData.originalPrice != null ? formData.originalPrice.toString() : ''}
          onChange={(e) => handleChange('originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
          error={errors.originalPrice}
          min="0"
          step="0.01"
          compact={compact}
        />
        <Input
          label="Stock"
          type="number"
          value={formData.stock.toString()}
          onChange={(e) => handleChange('stock', parseInt(e.target.value, 10) || 0)}
          error={errors.stock}
          required
          min="0"
          compact={compact}
        />
        <Input
          label="Capsule count (optional)"
          type="number"
          value={formData.capsuleCount != null ? formData.capsuleCount.toString() : ''}
          onChange={(e) => handleChange('capsuleCount', e.target.value ? parseInt(e.target.value, 10) : undefined)}
          min="0"
          compact={compact}
        />
        <Input
          label="Unit label (optional)"
          value={formData.unitLabel || ''}
          onChange={(e) => handleChange('unitLabel', e.target.value)}
          placeholder="e.g. 60 capsules total"
          compact={compact}
        />
        <Input
          label="Ingredients (comma separated)"
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          placeholder="Vitamin D, Calcium, Magnesium"
          compact={compact}
        />
        <Input
          label="Benefits (comma separated)"
          value={benefitsText}
          onChange={(e) => setBenefitsText(e.target.value)}
          placeholder="Better sleep, Reduced anxiety, Improved mood"
          compact={compact}
        />
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="supplement-suggestedUse">
            Suggested use (optional)
          </label>
          <textarea
            id="supplement-suggestedUse"
            className={styles.textarea}
            value={formData.suggestedUse || ''}
            onChange={(e) => handleChange('suggestedUse', e.target.value)}
            placeholder="e.g. Take one capsule before bed"
            rows={2}
          />
        </div>
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className={styles.checkbox}
            />
            <span>Active (visible to customers)</span>
          </label>
        </div>
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Product Image</label>
          <ImageUpload
            onUpload={(url) => handleChange('image', url)}
            initialUrl={formData.image}
            label="Upload Product Image"
            compact={compact}
          />
        </div>
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="supplement-galleryUrls">
            Gallery image URLs (optional, comma separated)
          </label>
          <input
            id="supplement-galleryUrls"
            type="text"
            className={styles.input}
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
          />
        </div>
      </div>
      <Button type="submit" variant="primary" loading={loading} className={styles.submitButton}>
        {submitLabel}
      </Button>
    </form>
  );
};

export default SupplementForm;
