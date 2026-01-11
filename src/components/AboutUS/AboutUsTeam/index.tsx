import styles from "./styles.module.css";

interface TeamMember {
    id: number;
    name: string;
    title: string;
    description: string;
}

const teamData: TeamMember[] = [
    {
        id: 1,
        name: "Dr. Sarah Johnson",
        title: "Co-Founder & Chief Clinical Officer",
        description: "Focuses on her vision for NeuraSleep, 15 years in clinical psychology and sleep research, and pioneering an evidence-based approach.",
    },
    {
        id: 2,
        name: "Michael Chen",
        title: "Co-Founder & CEO",
        description: "Mentions his personal struggles with sleep, co-founding NeuraSleep, and 12 years of healthcare innovation experience.",
    },
    {
        id: 3,
        name: "Emily Rodriguez",
        title: "Co-Founder & Head of Product",
        description: "Highlights her background in UX design and behavioral science, and ensuring Deep Rest Sessions are effective and relaxing.",
    },
    {
        id: 4,
        name: "Dr. James Williams",
        title: "Founding Advisor & Sleep Medicine Expert",
        description: "Details his role as a medical advisor, ensuring clinical standards, and 20 years in sleep medicine and research.",
    },
];

const AboutUsTeam = () => {
    return (
        <section className={styles.teamSection}>
            <div className={styles.teamHeader}>
                <h2 className={styles.teamTitle}>Meet Our Founding Team</h2>
                <p className={styles.teamSubtitle}>
                    Visionary leaders committed to transforming mental health and sleep wellness through innovation and compassionate care.
                </p>
            </div>
            <ul className={styles.teamContainer}>
                {teamData.map((member) => (
                    <li key={member.id} className={styles.teamCard}>
                        <div className={styles.cardImagePlaceholder}></div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.memberName}>{member.name}</h3>
                            <p className={styles.memberTitle}>{member.title}</p>
                            <p className={styles.memberDescription}>{member.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default AboutUsTeam;
