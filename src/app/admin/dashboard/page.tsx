import styles from './styles.module.css';

export default function AdminDashboardPage() {
    return (
        <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p>Welcome, Admin! Use the sidebar to manage doctors and therapies.</p>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Doctors</h3>
                    <p>Manage list of available doctors.</p>
                </div>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Therapies</h3>
                    <p>Manage therapy listings.</p>
                </div>
            </div>
        </div>
    );
}
