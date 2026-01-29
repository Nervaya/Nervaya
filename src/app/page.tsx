import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { IMAGES } from '@/utils/imageConstants';

import Cards from '@/components/LandingPageCards';
import Footer from '@/components/Footer';

const HomePage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundImageWrapper}>
        <Image
          src={IMAGES.BACKGROUND_MAIN}
          alt="Background Image"
          fill
          priority
          className={styles.backgroundImage}
          sizes="100vw"
          quality={85}
        />
      </div>
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
