import Link from 'next/link';
import styles from './page.module.css';

import Cards from '@/components/LandingPageCards';
import Footer from '@/components/Footer';

const HomePage = () => {
  return (
    <div className={styles.container}>
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Begin the body&apos;s natural detox
          <br />
          Sleep deeper, heal better.
        </h1>

        <p className={styles.heroSubtitle}>
          Personalized solutions for lasting sleep. Take our free sleep assessment to get one step closer to deep rest.
        </p>

        <div className={styles.buttonGroup}>
          <Link href="/sleep-assessment" className={styles.primaryButton}>
            Free Sleep Assessment
          </Link>
          <Link href="/support" className={styles.secondaryButton}>
            Get Free Assistance
          </Link>
        </div>
      </section>

      <Cards />

      <Footer />
    </div>
  );
};
export default HomePage;
