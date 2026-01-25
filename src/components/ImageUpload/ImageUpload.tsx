'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Loader from '@/components/common/Loader';
import styles from './styles.module.css';
import { FaCloudArrowUp, FaXmark } from 'react-icons/fa6';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  initialUrl?: string;
  label?: string;
}

const ImageUpload = ({ onUpload, initialUrl = '', label = 'Upload Image' }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when initialUrl changes
  useEffect(() => {
    if (initialUrl) {
      setPreview(initialUrl);
    }
  }, [initialUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { return; }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.url) {
        const imageUrl = data.data.url;
        setPreview(imageUrl);
        onUpload(imageUrl);
      } else {
        setError(data.message || data.error || 'Upload failed');
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
    <div className={`${styles.container} ${loading ? styles.uploading : ''}`} onClick={handleClick}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className={styles.input}
        accept="image/*"
      />

      {loading ? (
        <Loader size="md" text="Uploading..." />
      ) : preview ? (
        <>
          <Image
            src={preview}
            alt="Preview"
            width={200}
            height={200}
            className={styles.preview}
            unoptimized
          />
          <button className={styles.removeBtn} onClick={handleRemove} title="Remove image">
            <FaXmark size={12} />
          </button>
        </>
      ) : (
        <>
          <FaCloudArrowUp size={32} color="#7c3aed" />
          <p className={styles.label}>{label}</p>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default ImageUpload;
