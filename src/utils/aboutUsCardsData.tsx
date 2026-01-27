import React from 'react';
import { FaHeart, FaRibbon, FaUserGroup } from 'react-icons/fa6';

export interface AboutUsCard {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const aboutUsCardsData: AboutUsCard[] = [
  {
    id: 1,
    icon: <FaHeart />,
    title: 'Uncompromising Quality',
    description:
      'Each offering reflects our intention to bring our best forward through thoughtful, well-crafted products.',
  },
  {
    id: 2,
    icon: <FaRibbon />,
    title: 'Expert Therapists',
    description: 'Our team of licensed professionals brings years of experience in various therapeutic approaches.',
  },
  {
    id: 3,
    icon: <FaUserGroup />,
    title: 'Personalized Support',
    description: 'Every person is unique, and we tailor our approach to meet your individual needs and goals.',
  },
];
