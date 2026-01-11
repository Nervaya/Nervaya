import styles from "./styles.module.css";
import { FaHeart, FaRibbon, FaUserFriends } from "react-icons/fa";

interface AboutUsCard {
    id: number;
    icon: React.ReactNode;
    title: string;
    description: string;
}

const cardsData: AboutUsCard[] = [
    {
        id: 1,
        icon: <FaHeart />,
        title: "Uncompromising Quality",
        description: "Each offering reflects our intention to bring our best forward through thoughtful, well-crafted products.",
    },
    {
        id: 2,
        icon: <FaRibbon />,
        title: "Expert Therapists",
        description: "Our team of licensed professionals brings years of experience in various therapeutic approaches.",
    },
    {
        id: 3,
        icon: <FaUserFriends />,
        title: "Personalized Support",
        description: "Every person is unique, and we tailor our approach to meet your individual needs and goals.",
    },
];

const AboutUsCards = () => {
    return (
        <section className={styles.cardsSection}>
            <ul className={styles.cardsContainer}>
                {cardsData.map((card) => (
                    <li key={card.id} className={styles.card}>
                        <div className={styles.iconWrapper}>
                            {card.icon}
                        </div>
                        <h3 className={styles.cardTitle}>{card.title}</h3>
                        <p className={styles.cardDescription}>{card.description}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default AboutUsCards;
