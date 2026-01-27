'use client';

import React, { useState, useEffect } from 'react';
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
    price: initialData?.price || 0,
    image: initialData?.image || '',
    stock: initialData?.stock || 0,
    category: initialData?.category || '',
    ingredients: initialData?.ingredients || [],
    benefits: initialData?.benefits || [],
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const [ingredientsText, setIngredientsText] = useState(initialData?.ingredients?.join(', ') || '');
  const [benefitsText, setBenefitsText] = useState(initialData?.benefits?.join(', ') || '');
  const [errors, setErrors] = useState<Partial<Record<keyof SupplementFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        image: initialData.image || '',
        stock: initialData.stock || 0,
        category: initialData.category || '',
        ingredients: initialData.ingredients || [],
        benefits: initialData.benefits || [],
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
      setIngredientsText(initialData.ingredients?.join(', ') || '');
      setBenefitsText(initialData.benefits?.join(', ') || '');
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

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

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
    };

    await onSubmit(submitData);
  };

  const handleChange = (field: keyof SupplementFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
          containerClassName={styles.fullWidth}
        />
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>
            Description {errors.description && <span className={styles.errorText}>{errors.description}</span>}
          </label>
          <textarea
            className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            rows={4}
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
        />
        <Input
          label="Stock"
          type="number"
          value={formData.stock.toString()}
          onChange={(e) => handleChange('stock', parseInt(e.target.value, 10) || 0)}
          error={errors.stock}
          required
          min="0"
        />
        <Input
          label="Category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          error={errors.category}
          required
          containerClassName={styles.fullWidth}
        />
        <Input
          label="Ingredients (comma separated)"
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          containerClassName={styles.fullWidth}
          placeholder="Vitamin D, Calcium, Magnesium"
        />
        <Input
          label="Benefits (comma separated)"
          value={benefitsText}
          onChange={(e) => setBenefitsText(e.target.value)}
          containerClassName={styles.fullWidth}
          placeholder="Better sleep, Reduced anxiety, Improved mood"
        />
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
