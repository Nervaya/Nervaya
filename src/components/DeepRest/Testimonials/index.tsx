'use client';

import { TestimonialsCarousel, type TestimonialItem } from '@/components/common/TestimonialsCarousel';

const FALLBACK_REVIEWS: TestimonialItem[] = [
  {
    name: 'Jennifer Davis',
    initials: 'JD',
    rating: 5,
    comment:
      "The personalized deep rest sessions have transformed my sleep quality. I'm finally getting the rest I need after years of struggling.",
  },
  {
    name: 'Michael Kim',
    initials: 'MK',
    rating: 5,
    comment:
      "Amazing! The guided meditations are perfectly tailored to my needs. I've noticed significant improvements in just two weeks.",
  },
];

interface TestimonialsProps {
  reviews?: TestimonialItem[];
}

const Testimonials = ({ reviews }: TestimonialsProps) => {
  const displayReviews = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS;
  return <TestimonialsCarousel reviews={displayReviews} title="Testimonials" />;
};

export default Testimonials;
