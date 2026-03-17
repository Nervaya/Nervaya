import type { ChangeEvent } from 'react';
import { type BreadcrumbItem } from '@/components/common';

export interface TherapistFormData {
  name: string;
  email: string;
  qualifications: string;
  experience: string;
  gender: 'male' | 'female' | 'other';
  languages: string;
  specializations: string;
  image: string;
  introVideoUrl: string;
  bio: string;
  bioLong: string;
  quote: string;
  messageToClient: string;
  sessionFee: string;
  sessionDurationMins: string;
  testimonials: string;
}

export type TherapistFormChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

export interface TherapistFormFieldsProps {
  formData: TherapistFormData;
  onChange: (e: TherapistFormChangeEvent) => void;
}

export const ADD_THERAPIST_BREADCRUMBS: BreadcrumbItem[] = [
  { label: 'Admin', href: '/admin/dashboard' },
  { label: 'Therapists', href: '/admin/therapists' },
  { label: 'Add New' },
];

export const INITIAL_THERAPIST_FORM_DATA: TherapistFormData = {
  name: '',
  email: '',
  qualifications: '',
  experience: '',
  gender: 'other',
  languages: '',
  specializations: '',
  image: '',
  introVideoUrl: '',
  bio: '',
  bioLong: '',
  quote: '',
  messageToClient: '',
  sessionFee: '',
  sessionDurationMins: '',
  testimonials: '',
};
