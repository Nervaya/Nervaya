import styles from "./styles.module.css";

interface Stat {
    id: number;
    value: string;
    label: string;
}

const statsData: Stat[] = [
    {
        id: 1,
        value: "10,000+",
        label: "Happy Clients",
    },
    {
        id: 2,
        value: "50+",
        label: "Expert Therapists",
    },
    {
        id: 3,
        value: "15 Years",
        label: "Of Experience",
    },
    {
        id: 4,
        value: "98%",
        label: "Success Rate",
    },
];

const AboutUsStats = () => {
    return (
        <section className={styles.statsSection}>
            <ul className={styles.statsContainer}>
                {statsData.map((stat, index) => (
                    <li key={stat.id} className={styles.statItem}>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{stat.value}</div>
                            <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                        {index < statsData.length - 1 && (
                            <div className={styles.statDivider}></div>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default AboutUsStats;
