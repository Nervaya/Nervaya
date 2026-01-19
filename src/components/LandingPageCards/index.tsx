import Image from 'next/image';
import styles from './styles.module.css';
import { landingPageCardsData } from '@/utils/landingPageCardsData';

const Cards = () => {
  return (
    <section className={styles.cardsSection}>
      <ul className={styles.cardsContainer}>
        {landingPageCardsData.map((card) => (
          <li key={card.id} className={styles.card}>
            <div className={styles.cardImageWrapper}>
              {card.badge && (
                <span className={styles.badge}>{card.badge}</span>
              )}
              <Image
                src={card.image}
                alt={card.title}
                width={400}
                height={280}
                className={styles.cardImage}
                priority={card.id === 1}
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