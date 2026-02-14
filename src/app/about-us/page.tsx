import styles from './styles.module.css';
import AboutUsCards from '@/components/AboutUS/AboutUsCards';
import AboutUsTeam from '@/components/AboutUS/AboutUsTeam';
import AboutUsConsultation from '@/components/AboutUS/AboutUsConsultation';
import AboutUsStats from '@/components/AboutUS/AboutUsStats';

import Image from 'next/image';
import { IMAGES } from '@/utils/imageConstants';

const AboutUs = () => {
  return (
    <div className={styles.container}>
      <div className={styles.aboutUsSection}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <h1 className={styles.aboutUsTitleInside}>About Us</h1>
            <span className={styles.missionTag}>Our Mission</span>
            <h2 className={styles.cardHeading}>Helping You Find Peace and Balance</h2>
            <p className={styles.cardParagraph}>
              Trouble unwinding at night? Our expert therapists gently help you relax anxiety &amp; stress, release your
              natural sleep rhythm, and wake up feeling lighter and more refreshed all day. We provide personalized
              support to help you overcome challenges and achieve your wellness goals.
            </p>
            <p className={styles.cardParagraph}>
              Our approach combines evidence-based techniques with compassionate care, creating a safe space where you
              can explore your thoughts and feelings without judgment. We&apos;re here to support you every step of the
              way on your journey to better mental health and restful sleep.
            </p>
          </div>
          <div className={styles.cardImageWrapper}>
            {IMAGES.ABOUT_US_MAIN && (
              <Image
                src={IMAGES.ABOUT_US_MAIN}
                alt="About Us"
                fill
                className={styles.cardImage}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        </div>
      </div>
      <AboutUsCards />
      <AboutUsTeam />
      <AboutUsConsultation centerCard />
      <AboutUsStats />
    </div>
  );
};

export default AboutUs;
