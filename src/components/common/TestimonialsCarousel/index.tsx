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

export function TestimonialsCarousel({ reviews, title }: TestimonialsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dotCount, setDotCount] = useState(reviews.length);

  const updateDotCount = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cardEl = track.querySelector('[data-card]') as HTMLElement | null;
    if (!cardEl) return;
    const visible = Math.max(1, Math.round(track.clientWidth / (cardEl.clientWidth + 20)));
    setDotCount(Math.max(1, reviews.length - visible + 1));
  }, [reviews.length]);

  const updateActiveIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cardEl = track.querySelector('[data-card]') as HTMLElement | null;
    if (!cardEl) return;
    const cardWidth = cardEl.clientWidth + 20;
    setActiveIndex(Math.round(track.scrollLeft / cardWidth));
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cardEl = track.querySelector('[data-card]') as HTMLElement | null;
    if (!cardEl) return;
    track.scrollTo({ left: index * (cardEl.clientWidth + 20), behavior: 'smooth' });
  }, []);

  const scrollNext = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const cardWidth = (track.querySelector('[data-card]') as HTMLElement | null)?.clientWidth ?? 0;
    const scrollAmount = cardWidth + 20;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (track.scrollLeft >= maxScroll - 2) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    updateDotCount();
    window.addEventListener('resize', updateDotCount);
    return () => window.removeEventListener('resize', updateDotCount);
  }, [updateDotCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', updateActiveIndex, { passive: true });
    return () => track.removeEventListener('scroll', updateActiveIndex);
  }, [updateActiveIndex]);

  useEffect(() => {
    if (reviews.length <= 1 || isPaused) return;
    const interval = setInterval(scrollNext, 4000);
    return () => clearInterval(interval);
  }, [reviews.length, isPaused, scrollNext]);

  if (reviews.length === 0) return null;

  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div
        className={styles.track}
        ref={trackRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {reviews.map((review) => (
          <div key={`${review.name}-${review.comment.slice(0, 20)}`} className={styles.card} data-card>
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

      {reviews.length > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: dotCount }, (_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
