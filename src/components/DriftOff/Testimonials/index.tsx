import { Icon } from '@iconify/react';
import { ICON_STAR } from '@/constants/icons';
import styles from './styles.module.css';

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: 'Jennifer Davis',
      initials: 'JD',
      stars: 5,
      text: '"The personalized deep rest sessions have transformed my sleep quality. I\'m finally getting the rest I need after years of struggling."',
    },
    {
      id: 2,
      name: 'Michael Kim',
      initials: 'MK',
      stars: 5,
      text: '"Amazing! The guided meditations are perfectly tailored to my needs. I\'ve noticed significant improvements in just two weeks."',
    },
  ];

  return (
    <ul className={styles.testimonialsSection} aria-label="Testimonials">
      {reviews.map((review) => (
        <li key={review.id} className={styles.testimonialCard}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>{review.initials}</div>
            <div className={styles.userInfo}>
              <h4>{review.name}</h4>
              <div className={styles.stars}>
                {['s1', 's2', 's3', 's4', 's5'].slice(0, review.stars).map((starKey) => (
                  <Icon icon={ICON_STAR} key={`${review.id}-${starKey}`} width={14} height={14} />
                ))}
              </div>
            </div>
          </div>
          <p className={styles.testimonialText}>{review.text}</p>
        </li>
      ))}
    </ul>
  );
};

export default Testimonials;
