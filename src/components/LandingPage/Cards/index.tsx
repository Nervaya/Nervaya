import Image from "next/image";
import styles from "./index.module.css";

interface Card {
    id: number;
    image: string;
    title: string;
    description: string;
    buttonText: string;
    badge?: string;
}

const cardsData: Card[] = [
    {
        id: 1,
        image: "/cards-img/img-1.jpg",
        title: "Therapy",
        description: "Trouble unwinding at night? Our expert therapists gently help you release anxiety & stress, restore your natural sleep rhythm, and wake up feeling lighter and more refreshed all day.",
        buttonText: "Book Now",
    },
    {
        id: 2,
        image: "/cards-img/img-2.jpg",
        title: "Drift Off",
        description: "Tailor-made sessions crafted just for you by blending guided hypnosis & meditation to help you release the day's burdens and drift into a quieter, more peaceful dimension. Wake up rejuvenated every morning.",
        buttonText: "Explore Now",
    },
    {
        id: 3,
        image: "/cards-img/img-3.jpg",
        title: "Sleep Elixir",
        description: "Our non-habit-forming, fast-absorbing formula helps you unwind naturally and drift into deep, restorative sleep — waking refreshed, never dependent.",
        buttonText: "Shop Now",
        badge: "Coming Soon",
    },
];

const Cards = () => {
    return (
        <section className={styles.cardsSection}>
            <div className={styles.cardsContainer}>
                {cardsData.map((card) => (
                    <div key={card.id} className={styles.card}>
                        <div className={styles.cardImageWrapper}>
                            {card.badge && (
                                <span className={styles.badge}>{card.badge}</span>
                            )}
                            <Image
                                src={card.image}
                                alt={card.title}
                                width={300}
                                height={200}
                                className={styles.cardImage}
                            />
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{card.title}</h3>
                            <p className={styles.cardDescription}>{card.description}</p>
                            <button className={styles.cardButton}>{card.buttonText}</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Cards;