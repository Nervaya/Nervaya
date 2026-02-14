'use client';

import { FaCheck } from 'react-icons/fa';
import styles from './styles.module.css';

const LEFT_FEATURES = [
  'Scientifically-backed audio techniques',
  'Available anytime, anywhere',
  'Progressive improvement over time',
];

const RIGHT_FEATURES = [
  'Customized to your sleep patterns',
  'No medication or side effects',
  'Expert support included',
];

const WhatMakesDifferentSection = () => {
  return (
    <div className={styles.whatAreCard}>
      <p className={`${styles.whatAreText} ${styles.whatMakesIntro}`}>
        Every session is built around your goals and preferences. We combine evidence-based methods with one-on-one
        input so you get a rest experience that fits you—not a one-size-fits-all track.
      </p>
      <div className={styles.whatMakesGrid}>
        <ul aria-label="Session features">
          {LEFT_FEATURES.map((feature) => (
            <li key={feature} className={styles.whatMakesItem}>
              <FaCheck className={styles.whatMakesBullet} aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <ul aria-label="Session benefits">
          {RIGHT_FEATURES.map((feature) => (
            <li key={feature} className={styles.whatMakesItem}>
              <FaCheck className={styles.whatMakesBullet} aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WhatMakesDifferentSection;
