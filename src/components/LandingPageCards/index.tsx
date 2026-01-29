import Image from 'next/image';
import styles from './styles.module.css';
import { landingPageCardsData } from '@/utils/landingPageCardsData';

const Cards = () => {
  return (
    <section className={styles.cardsSection}>
      <h2 className={styles.sectionTitle}>Explore our sleep solutions</h2>
      <ul className={styles.cardsContainer}>
        {landingPageCardsData.map((card) => (
          <li key={card.id} className={styles.card}>
            <div className={styles.cardImageWrapper}>
              {card.badge && <span className={styles.badge}>{card.badge}</span>}
              <Image
                src={card.image}
                alt={card.title}
                fill
                className={styles.cardImage}
                priority={card.id === 1}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
              <button className={styles.cardButton}>{card.buttonText}</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Cards;
