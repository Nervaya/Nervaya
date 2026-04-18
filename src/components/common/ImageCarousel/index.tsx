'use client';

import { useState } from 'react';
import styles from './styles.module.css';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
}

export function ImageCarousel({ images, alt = 'Gallery image' }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const safeIndex = Math.min(index, images.length - 1);
  const current = images[safeIndex];

  return (
    <div className={styles.carousel}>
      <div className={styles.viewport}>
        <div className={styles.backdrop} style={{ backgroundImage: `url(${current})` }} aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={`${alt} ${safeIndex + 1}`} className={styles.image} />
      </div>
      {images.length > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Gallery navigation">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === safeIndex}
              aria-label={`Show image ${i + 1}`}
              className={`${styles.dot} ${i === safeIndex ? styles.dotActive : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
