'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Icon } from '@iconify/react';
import { ICON_STAR } from '@/constants/icons';
import styles from './styles.module.css';

export interface TestimonialItem {
  name: string;
  rating: number;
  comment: string;
  initials: string;
}

interface TestimonialsCarouselProps {
  reviews: TestimonialItem[];
  title?: string;
}

export function TestimonialsCarousel({ reviews, title = 'Testimonials' }: TestimonialsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollNext = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const cardWidth = track.querySelector('[data-card]')?.clientWidth ?? 0;
    const gap = 20;
    const scrollAmount = cardWidth + gap;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (track.scrollLeft >= maxScroll - 2) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (reviews.length <= 2 || isPaused) return;
    const interval = setInterval(scrollNext, 4000);
    return () => clearInterval(interval);
  }, [reviews.length, isPaused, scrollNext]);

  if (reviews.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div
        className={styles.track}
        ref={trackRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {reviews.map((review, idx) => (
          <div key={`${review.name}-${idx}`} className={styles.card} data-card>
            <div className={styles.userRow}>
              <div className={styles.avatar}>{review.initials}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{review.name}</span>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon
                      key={i}
                      icon={ICON_STAR}
                      width={14}
                      height={14}
                      className={i < review.rating ? styles.starFilled : styles.starEmpty}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className={styles.comment}>&ldquo;{review.comment}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
