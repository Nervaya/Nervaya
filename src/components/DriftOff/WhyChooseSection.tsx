'use client';

import { FaBrain, FaMoon, FaStar, FaUserShield } from 'react-icons/fa';
import styles from './styles.module.css';

const BENEFITS = [
  {
    id: 'neuroplasticity',
    title: 'Neuroplasticity',
    text: 'Harness the power of your brain to rewire sleep patterns.',
    icon: FaBrain,
  },
  {
    id: 'better-sleep',
    title: 'Better Sleep',
    text: 'Fall asleep faster and enjoy deeper, more restful nights.',
    icon: FaMoon,
  },
  {
    id: 'personalized',
    title: 'Personalized',
    text: 'Custom sessions tailored to your unique needs.',
    icon: FaStar,
  },
  {
    id: 'expert-guided',
    title: 'Expert-Guided',
    text: 'Created by certified sleep and wellness specialists.',
    icon: FaUserShield,
  },
] as const;

const WhyChooseSection = () => {
  return (
    <ul className={styles.whyChooseGrid} aria-label="Why choose Deep Rest Sessions">
      {BENEFITS.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id} className={styles.whyChooseCard}>
            <div className={styles.whyChooseIcon} aria-hidden>
              <Icon />
            </div>
            <h3 className={styles.whyChooseTitle}>{item.title}</h3>
            <p className={styles.whyChooseText}>{item.text}</p>
          </li>
        );
      })}
    </ul>
  );
};

export default WhyChooseSection;
