import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

import Cards from '@/components/LandingPageCards';
import Footer from '@/components/Footer';

const HomePage = () => {
  return (
    <div className={styles.container}>
      <section className={styles.heroSection}>
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine}>Begin the body&apos;s natural detox</span>
            <span className={styles.heroTitleLine}>Sleep deeper, heal better.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Personalized solutions for lasting sleep. Take our free sleep assessment to get one step closer to deep
            rest.
          </p>

          <div className={styles.buttonGroup}>
            <Link href="/sleep-assessment" className={styles.primaryButton}>
              Free Sleep Assessment
            </Link>
            <Link href="/support" className={styles.secondaryButton}>
              Get Free Assistance
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.visualPanel}>
            <div className={styles.visualImageWrap}>
              <Image
                src="/email-assets/welcome-hero.png"
                alt=""
                fill
                className={styles.visualImage}
                priority
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 42vw, 500px"
              />
            </div>
          </div>
        </div>
      </section>

      <Cards />

      <Footer />
    </div>
  );
};
export default HomePage;
