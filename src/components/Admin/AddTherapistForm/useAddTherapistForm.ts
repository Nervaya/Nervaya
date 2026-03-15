'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { therapistsApi } from '@/lib/api/therapists';
import { uploadApi } from '@/lib/api/upload';
import { parseCommaSeparated, parseTestimonials } from '@/lib/utils/therapist.utils';
import { INITIAL_THERAPIST_FORM_DATA, type TherapistFormChangeEvent, type TherapistFormData } from './formData';

export function useAddTherapistForm() {
  const router = useRouter();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<TherapistFormData>(INITIAL_THERAPIST_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof TherapistFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (e: TherapistFormChangeEvent) => {
    const { name, value } = e.target;
    setField(name as keyof TherapistFormData, value);
  };

  const handleImageUpload = (url: string) => {
    setField('image', url);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setVideoUploading(true);
    setError(null);

    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      const response = await uploadApi.video(uploadForm);

      if (response.success && response.data?.url) {
        setField('introVideoUrl', response.data.url);
      } else {
        setError(response.message || 'Video upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video upload failed');
    } finally {
      setVideoUploading(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        gender: formData.gender,
        qualifications: parseCommaSeparated(formData.qualifications),
        languages: parseCommaSeparated(formData.languages),
        specializations: parseCommaSeparated(formData.specializations),
        galleryImages: parseCommaSeparated(formData.galleryImages),
        sessionModes: parseCommaSeparated(formData.sessionModes),
        testimonials: parseTestimonials(formData.testimonials),
        sessionFee: formData.sessionFee ? Number(formData.sessionFee) : 0,
        sessionDurationMins: formData.sessionDurationMins ? Number(formData.sessionDurationMins) : 0,
      };

      const result = await therapistsApi.create(payload);

      if (result.success) {
        router.push('/admin/therapists');
        return;
      }

      setError(result.message || 'Failed to create therapist');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    formData,
    handleChange,
    handleImageUpload,
    handleSubmit,
    handleVideoUpload,
    loading,
    videoInputRef,
    videoUploading,
  };
}
