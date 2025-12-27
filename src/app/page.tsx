import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import Cards from "@/components/LandingPage/Cards";

const HomePage = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Begin the body's natural detox<br />
          Sleep deeper, heal better.
        </h1>

        <p className={styles.heroSubtitle}>
          Personalized solutions for lasting sleep,Take our free sleep assessment to get one step closer to deep rest
        </p>

        <div className={styles.buttonGroup}>
          <button className={styles.primaryButton}>
            Free Sleep Assessment
          </button>
          <button className={styles.secondaryButton}>
            Get Free Assistance
          </button>
        </div>
      </section>

      <Cards />
    </div>
  );
};

export default HomePage;