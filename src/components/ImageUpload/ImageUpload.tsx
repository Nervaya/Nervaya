'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { ICON_UPLOAD, ICON_CLOSE } from '@/constants/icons';
import { uploadApi } from '@/lib/api/upload';
import LottieLoader from '@/components/common/LottieLoader';
import styles from './styles.module.css';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  initialUrl?: string;
  label?: string;
  compact?: boolean;
}

const ImageUpload = ({ onUpload, initialUrl = '', label = 'Upload Image', compact = false }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialUrl) {
      setPreview(initialUrl);
    }
  }, [initialUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await uploadApi.image(formData);

      if (data.success && data.data?.url) {
        const imageUrl = data.data.url;
        setPreview(imageUrl);
        onUpload(imageUrl);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      if (err instanceof Error) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview('');
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`${styles.container} ${loading ? styles.uploading : ''} ${compact ? styles.compact : ''}`}
      onClick={handleClick}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className={styles.input} accept="image/*" />

      {loading ? (
        <LottieLoader width={50} height={50} />
      ) : preview ? (
        <>
          <Image
            src={preview}
            alt="Preview"
            width={200}
            height={200}
            className={compact ? styles.previewCompact : styles.preview}
            unoptimized
          />
          <button className={styles.removeBtn} onClick={handleRemove} title="Remove image">
            <Icon icon={ICON_CLOSE} width={12} height={12} />
          </button>
        </>
      ) : (
        <>
          <Icon icon={ICON_UPLOAD} width={32} height={32} color="#7c3aed" />
          <p className={styles.label}>{label}</p>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default ImageUpload;
